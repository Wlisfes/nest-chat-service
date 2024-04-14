import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { NodemailerService } from '@/services/nodemailer/nodemailer.service'
import { RedisService } from '@/services/redis/redis.service'
import { CustomService } from '@/services/custom.service'
import { divineResolver, divineIntNumber, divineHandler, divineLogger } from '@/utils/utils-common'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineSelection } from '@/utils/utils-typeorm'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'
import { UserEntier } from '@/entities/user'

@Injectable()
export class NotificationService {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger, private readonly custom: CustomService) {}

    /**更新通知状态**/
    public async httpNotificationUpdate(headers: env.Headers, userId: string, scope: env.BodyNotificationUpdate) {
        const connect = await this.custom.divineConnectTransaction()
        try {
            //prettier-ignore
            const data = await this.custom.divineHaver(this.custom.tableNotification, {
                headers,
                message: 'UID不存在',
                dispatch: { where: { uid: scope.uid, niveId: userId } }
            }).then(async node => {
                await divineCatchWherer(['resolve', 'reject'].includes(node.status), {
                    message: '通知信息已处理，不可再次操作'
                })
                await divineCatchWherer(['waitze'].includes(node.status) && scope.status === 'waitze', {
                    message: '通知状态不可更新成waitze'
                })
                return await divineResolver(node)
            })
            /**更新通知状态**/
            await this.custom.divineUpdate(this.custom.tableNotification, {
                headers,
                where: { uid: scope.uid },
                state: { status: scope.status }
            })
            if (data.source === 'contact' && scope.status === 'resolve') {
                /**好友申请**/
                return await this.custom.divineBuilder(this.custom.tableContact, async qb => {
                    qb.where('(t.userId = :userId AND t.niveId = :niveId) OR (t.userId = :niveId AND t.userId = :userId)', {
                        userId: data.userId,
                        niveId: data.niveId
                    })
                    return qb.getOne().then(async node => {
                        if (node) {
                            this.logger.info(
                                [NotificationService.name, this.httpNotificationUpdate.name].join(':'),
                                divineLogger(headers, { message: '存在好友关联记录', node })
                            )
                            /**存在好友关联记录、好友状态切换到启用-enable**/
                            await this.custom.divineUpdate(this.custom.tableContact, {
                                headers,
                                where: { keyId: node.keyId },
                                state: { status: 'enable', userId: data.userId, niveId: data.niveId }
                            })
                            return await connect.commitTransaction().then(async () => {
                                this.logger.info(
                                    [NotificationService.name, this.httpNotificationUpdate.name].join(':'),
                                    divineLogger(headers, { message: '添加好友成功', userId: data.userId, niveId: data.niveId })
                                )
                                return await divineResolver({ message: '添加成功' })
                            })
                        }
                        /**不存在好友关联记录、新增一条记录**/
                        await this.custom.divineCreate(this.custom.tableContact, {
                            headers,
                            state: {
                                uid: await divineIntNumber(),
                                status: 'enable',
                                userId: data.userId,
                                niveId: data.niveId
                            }
                        })
                        return await connect.commitTransaction().then(async () => {
                            this.logger.info(
                                [NotificationService.name, this.httpNotificationUpdate.name].join(':'),
                                divineLogger(headers, { message: '添加好友成功', userId: data.userId, niveId: data.niveId })
                            )
                            return await divineResolver({ message: '添加成功' })
                        })
                    })
                })
            } else if (data.source === 'communit' && scope.status === 'resolve') {
                /**群聊申请**/
            }
        } catch (e) {
            await connect.rollbackTransaction()
            this.logger.error(
                [NotificationService.name, this.httpNotificationUpdate.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        } finally {
            await connect.release()
        }
    }

    /**通知列表**/ //prettier-ignore
    public async httpNotificationColumn(headers: env.Headers, userId: string) {
        try {
            return await this.custom.divineBuilder(this.custom.tableNotification, async qb => {
                qb.leftJoinAndMapOne('t.user', UserEntier, 'user', 'user.uid = t.userId')
                qb.leftJoinAndMapOne('t.nive', UserEntier, 'nive', 'nive.uid = t.niveId')
                qb.select([
                    ...divineSelection('t', ['keyId', 'uid', 'createTime', 'updateTime', 'source', 'userId', 'niveId', 'communitId', 'status']),
                    ...divineSelection('user', ['uid', 'nickname', 'avatar', 'status']),
                    ...divineSelection('nive', ['uid', 'nickname', 'avatar', 'status'])
                ])
                qb.where('t.userId = :userId OR t.niveId = :userId', { userId })
                return await qb.getManyAndCount().then(async ([total = 0, list = []]) => {
                    return await divineResolver({ total, list })
                })
            })
        } catch (e) {
            this.logger.error(
                [NotificationService.name, this.httpNotificationColumn.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
