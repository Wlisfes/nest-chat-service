import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { ClientProxy } from '@nestjs/microservices'
import { isNotEmpty } from 'class-validator'
import { CustomService } from '@/services/custom.service'
import { UserService } from '@/services/user.service'
import { MessagerService } from '@/services/messager.service'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineSelection } from '@/utils/utils-typeorm'
import { divineClientSender } from '@/utils/utils-microservices'
import { divineResolver, divineIntNumber, divineLogger, divineHandler } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class CommunitService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        @Inject('WEB-SOCKET') private socketClient: ClientProxy,
        private readonly customService: CustomService,
        private readonly userService: UserService,
        private readonly messagerService: MessagerService
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
            await this.customService.divineHaver(this.customService.tableMedia, {
                headers,
                message: 'fileId不存在或者文件类型错误',
                dispatch: {
                    where: {
                        userId: userId,
                        fileId: scope.poster,
                        source: entities.MediaEntierSource.image
                    }
                }
            })
            /**新建社群记录**/
            const communitId = await divineIntNumber()
            const sessionId = await divineIntNumber()
            const { nickname } = await this.userService.httpUserResolver(headers, userId)
            const communit = await this.customService.divineCreate(this.customService.tableCommunit, {
                headers,
                state: {
                    uid: communitId,
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
                    status: entities.EnumCommunitMemberStatus.enable,
                    speak: false
                }
            })
            /**新建群聊会话**/
            await this.customService.divineCreate(this.customService.tableSession, {
                headers,
                state: {
                    sid: sessionId,
                    source: entities.EnumSessionSource.communit,
                    communitId: communitId
                }
            })
            /**新增用户Socket会话房间**/
            await divineClientSender(this.socketClient, {
                eventName: 'web-socket-refresh-session',
                headers,
                state: { userId: userId, sid: sessionId }
            })
            /**插入一条记录**/
            await this.messagerService.httpCommonCustomizeMessager(headers, userId, {
                source: entities.EnumMessagerSource.text,
                referrer: entities.EnumMessagerReferrer.http,
                sessionId: sessionId,
                text: `${nickname}创建了社群：“${scope.name}”`,
                fileId: ''
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
            const communit = await this.customService.divineHaver(this.customService.tableCommunit, {
                headers,
                message: '社群不存在',
                dispatch: { where: { uid: scope.uid } }
            }).then(async node => {
                await divineCatchWherer(node && node.status === entities.EnumCommunitStatus.dissolve, {
                    message: '该社群已解散'
                })
                /**判断用户是否已加入社群**/
                await this.customService.divineNoner(this.customService.tableCommunitMember, {
                    headers,
                    message: '您已加入该社群，无需再次发起申请',
                    dispatch: {
                        where: {
                            communitId: scope.uid,
                            userId: userId,
                            status: entities.EnumCommunitMemberStatus.enable
                        }
                    }
                })
                return await divineResolver(node)
            })
            /**处理申请记录**/
            return await this.customService.divineBuilder(this.customService.tableNotification, async qb => {
                qb.where('t.userId = :userId AND t.communitId = :communitId AND t.source = :source', {
                    source: entities.EnumNotificationSource.communit,
                    userId: userId,
                    communitId: scope.uid
                })
                return await qb.getOne().then(async node => {
                    /**输出申请记录日志**/
                    await divineHandler(Boolean(node), {
                        handler: () => {
                            this.logger.info(
                                [CommunitService.name, this.httpCommunitInviteJoiner.name].join(':'),
                                divineLogger(headers, { message: '存在申请记录', node })
                            )
                        }
                    })
                    if (Boolean(node)) {
                        /**存在申请记录**/
                        await this.customService.divineUpdate(this.customService.tableNotification, {
                            headers,
                            where: { uid: node.uid },
                            state: {
                                status: entities.EnumNotificationStatus.waitze,
                                command: [communit.ownId],
                                json: { [userId]: { uid: userId, comment: scope.comment, date: Date.now() } }
                            }
                        })
                        await divineClientSender(this.socketClient, {
                            eventName: 'web-socket-push-notification',
                            headers,
                            state: {
                                userId: communit.ownId,
                                data: await this.customService.tableNotification.findOne({ where: { uid: node.uid } })
                            }
                        })
                    } else {
                        /**不存在申请记录**/
                        const notifyId = await divineIntNumber()
                        await this.customService.divineCreate(this.customService.tableNotification, {
                            headers,
                            state: {
                                uid: notifyId,
                                source: entities.EnumNotificationSource.communit,
                                status: entities.EnumNotificationStatus.waitze,
                                communitId: scope.uid,
                                userId: userId,
                                command: [communit.ownId],
                                json: {
                                    [userId]: { uid: userId, comment: scope.comment, date: Date.now() }
                                }
                            }
                        })
                        await divineClientSender(this.socketClient, {
                            eventName: 'web-socket-push-notification',
                            headers,
                            state: {
                                userId: communit.ownId,
                                data: await this.customService.tableNotification.findOne({ where: { uid: notifyId } })
                            }
                        })
                    }
                    return await connect.commitTransaction().then(async () => {
                        this.logger.info(
                            [CommunitService.name, this.httpCommunitInviteJoiner.name].join(':'),
                            divineLogger(headers, { message: '申请加入社群成功', userId, communitId: scope.uid })
                        )
                        return await divineResolver({ message: '申请成功' })
                    })
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

    /**关键字列表搜索**/
    public async httpCommunitSearch(headers: env.Headers, userId: string, scope: env.BodyCommunitSearch) {
        try {
            return await this.customService.divineBuilder(this.customService.tableCommunit, async qb => {
                if (isNotEmpty(scope.keyword)) {
                    qb.where('t.ownId != :userId AND (t.uid LIKE :uid OR t.name LIKE :name)', {
                        userId: userId,
                        uid: `%${scope.keyword}%`,
                        name: `%${scope.keyword}%`
                    })
                } else {
                    qb.where('t.ownId != :userId', { userId })
                }
                return qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                    return await divineResolver({ total, list })
                })
            })
        } catch (e) {
            this.logger.error(
                [CommunitService.name, this.httpCommunitSearch.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**社群列表**/
    public async httpCommunitColumn(headers: env.Headers, userId: string) {
        try {
            return await this.customService.divineBuilder(this.customService.tableCommunit, async qb => {
                qb.leftJoinAndMapOne('t.poster', entities.MediaEntier, 'poster', 't.poster = poster.fileId')
                qb.leftJoinAndMapOne(
                    't.member',
                    entities.CommunitMemberEntier,
                    'member',
                    'member.communitId = t.uid AND member.status = :status AND member.userId = :userId',
                    { userId: userId, status: entities.EnumCommunitMemberStatus.enable }
                )
                qb.select([
                    ...divineSelection('t', ['keyId', 'uid', 'createTime', 'updateTime', 'name', 'status', 'ownId', 'speak', 'comment']),
                    ...divineSelection('member', ['keyId', 'createTime', 'updateTime', 'userId', 'communitId', 'speak', 'status']),
                    ...divineSelection('poster', ['fileId', 'fileURL', 'height', 'width'])
                ])
                qb.where(`member.userId = :userId`, { userId: userId })
                return qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                    return await divineResolver({ total, list })
                })
            })
        } catch (e) {
            this.logger.error(
                [CommunitService.name, this.httpCommunitSearch.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**社群详情**/
    public async httpCommunitResolver(headers: env.Headers, userId: string, scope: env.QueryCommunitResolver) {
        try {
            return await this.customService.divineBuilder(this.customService.tableCommunit, async qb => {
                qb.leftJoinAndMapOne('t.poster', entities.MediaEntier, 'poster', 't.poster = poster.fileId')
                qb.innerJoinAndMapMany(
                    't.member',
                    entities.CommunitMemberEntier,
                    'member',
                    'member.communitId = t.uid AND member.status = :status',
                    { status: entities.EnumCommunitMemberStatus.enable }
                )
                qb.leftJoinAndMapOne('member.user', entities.UserEntier, 'user', 'user.uid = member.userId')
                qb.where(`t.uid = :uid`, { userId: userId, uid: scope.uid })
                qb.cache(5000)
                return qb.getOne().then(async (node: env.Omix) => {
                    await this.customService.divineCatchWherer(!Boolean(node), node, {
                        message: '社群ID不存在'
                    })
                    await this.customService.divineCatchWherer(!node.member.some(item => item.userId === userId), node, {
                        message: '您不是该社群成员，无法查看详情'
                    })
                    return await divineResolver(node)
                })
            })
        } catch (e) {
            this.logger.error(
                [CommunitService.name, this.httpCommunitResolver.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
