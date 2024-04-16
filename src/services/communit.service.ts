import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CustomService } from '@/services/custom.service'
import { SessionService } from '@/services/session.service'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineResolver, divineIntNumber, divineLogger, divineHandler } from '@/utils/utils-common'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class CommunitService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly customService: CustomService,
        private readonly sessionService: SessionService
    ) {}

    /**新建社群**/
    public async httpCommunitCreater(headers: env.Headers, userId: string, scope: env.BodyCommunitCreater) {
        const connect = await this.customService.divineConnectTransaction()
        try {
            await this.customService.divineNoner(this.customService.tableCommunit, {
                headers,
                message: '社群名称已存在或被占用',
                dispatch: { where: { name: scope.name } }
            })
            await this.customService.divineNoner(this.customService.tableMedia, {
                headers,
                message: 'fileId不存在或者文件类型错误',
                dispatch: {
                    where: { fileId: scope.poster, source: entities.MediaEntierSource.avatar }
                }
            })
            /**新建社群记录**/
            const communit = await this.customService.divineCreate(this.customService.tableCommunit, {
                headers,
                state: {
                    uid: await divineIntNumber(),
                    status: entities.EnumCommunitStatus.enable,
                    name: scope.name,
                    poster: scope.poster,
                    comment: scope.comment,
                    ownId: userId,
                    speak: false
                }
            })
            /**新建社群成员记录**/
            await this.customService.divineCreate(this.customService.tableCommunitMember, {
                headers,
                state: {
                    communitId: communit.uid,
                    userId: userId,
                    role: entities.EnumCommunitMemberRole.master,
                    status: entities.EnumCommunitMemberStatus.enable,
                    speak: false
                }
            })
            /**新建群聊会话**/
            await this.sessionService.httpSessionCommunitCreater(headers, {
                communitId: communit.uid
            })
            return await connect.commitTransaction().then(async () => {
                this.logger.info(
                    [CommunitService.name, this.httpCommunitCreater.name].join(':'),
                    divineLogger(headers, { message: '新建社群成功', communit })
                )
                return await divineResolver({ message: '新建成功' })
            })
        } catch (e) {
            await connect.rollbackTransaction()
            this.logger.error(
                [CommunitService.name, this.httpCommunitCreater.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        } finally {
            await connect.release()
        }
    }

    /**申请加入社群**/
    public async httpCommunitInviteJoiner(headers: env.Headers, userId: string, scope: env.BodyCommunitInviteJoiner) {
        const connect = await this.customService.divineConnectTransaction()
        try {
            /**判断社群是否存在**/ //prettier-ignore
            await this.customService.divineHaver(this.customService.tableCommunit, {
                headers,
                message: '社群不存在',
                dispatch: { where: { uid: scope.uid } }
            }).then(async node => {
                return await divineCatchWherer(node && node.status === entities.EnumCommunitStatus.dissolve, {
                    message: '该社群已解散'
                })
            })
            /**判断用户是否已加入社群**/
            await this.customService.divineNoner(this.customService.tableCommunitMember, {
                headers,
                message: '您已加入该社群',
                dispatch: {
                    where: {
                        communitId: scope.uid,
                        userId: userId,
                        status: entities.EnumCommunitMemberStatus.enable
                    }
                }
            })
            /**处理申请记录**/
            const node = await this.customService.divineBuilder(this.customService.tableNotification, async qb => {
                qb.where('t.userId = :userId AND t.communitId = :communitId AND t.source = :source', {
                    source: entities.EnumNotificationSource.communit,
                    userId: userId,
                    communitId: scope.uid
                })
                return qb.getOne()
            })
            if (node) {
                /**存在社群申请记录**/
                this.logger.info(
                    [CommunitService.name, this.httpCommunitInviteJoiner.name].join(':'),
                    divineLogger(headers, { message: '存在社群申请记录', node })
                )
                /**通知状态切换到waitze-待处理**/
                await this.customService.divineUpdate(this.customService.tableNotification, {
                    headers,
                    where: { keyId: node.keyId },
                    state: { status: entities.EnumNotificationStatus.waitze }
                })
                return await connect.commitTransaction().then(async () => {
                    this.logger.info(
                        [CommunitService.name, this.httpCommunitInviteJoiner.name].join(':'),
                        divineLogger(headers, { message: '申请加入社群成功', node })
                    )
                    return await divineResolver({ message: '申请成功' })
                })
            }
            /**不存在申请记录、新增一条申请记录**/ //prettier-ignore
            return await this.customService.divineCreate(this.customService.tableNotification, {
                headers,
                state: {
                    uid: await divineIntNumber(),
                    source: entities.EnumNotificationSource.communit,
                    status: entities.EnumNotificationStatus.waitze,
                    communitId: scope.uid,
                    userId: userId
                }
            }).then(async result => {
                return await connect.commitTransaction().then(async () => {
                    this.logger.info(
                        [CommunitService.name, this.httpCommunitInviteJoiner.name].join(':'),
                        divineLogger(headers, { message: '申请加入社群成功', node: result })
                    )
                    return await divineResolver({ message: '申请成功' })
                })
            })
        } catch (e) {
            await connect.rollbackTransaction()
            this.logger.error(
                [CommunitService.name, this.httpCommunitCreater.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        } finally {
            await connect.release()
        }
    }
}
