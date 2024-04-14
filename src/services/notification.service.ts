import { Injectable, Inject, forwardRef, HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CustomService } from '@/services/custom.service'
import { SessionService } from '@/services/session.service'
import { divineResolver, divineIntNumber, divineHandler, divineLogger } from '@/utils/utils-common'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineSelection } from '@/utils/utils-typeorm'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class NotificationService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly customService: CustomService,
        private readonly sessionService: SessionService
    ) {}

    /**更新通知状态**/
    public async httpNotificationUpdate(headers: env.Headers, userId: string, scope: env.BodyNotificationUpdate) {
        const connect = await this.customService.divineConnectTransaction()
        try {
            //prettier-ignore
            const data = await this.customService.divineHaver(this.customService.tableNotification, {
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
            await this.customService.divineUpdate(this.customService.tableNotification, {
                headers,
                where: { uid: scope.uid },
                state: { status: scope.status }
            })
            /**好友申请**/
            if (data.source === 'contact' && scope.status === 'resolve') {
                const node = await this.customService.divineBuilder(this.customService.tableContact, async qb => {
                    qb.where('(t.userId = :userId AND t.niveId = :niveId) OR (t.userId = :niveId AND t.userId = :userId)', {
                        userId: data.userId,
                        niveId: data.niveId
                    })
                    return qb.getOne()
                })
                /**存在好友关联记录**/
                if (node) {
                    this.logger.info(
                        [NotificationService.name, this.httpNotificationUpdate.name].join(':'),
                        divineLogger(headers, { message: '存在好友关联记录', node })
                    )
                    /**好友状态切换到启用-enable**/
                    await this.customService.divineUpdate(this.customService.tableContact, {
                        headers,
                        where: { keyId: node.keyId },
                        state: { status: 'enable', userId: data.userId, niveId: data.niveId }
                    })
                    /**新建私聊会话**/
                    await this.sessionService.httpSessionContactCreater(headers, {
                        contactId: node.uid
                    })
                    return await connect.commitTransaction().then(async () => {
                        this.logger.info(
                            [NotificationService.name, this.httpNotificationUpdate.name].join(':'),
                            divineLogger(headers, { message: '添加好友成功', userId: data.userId, niveId: data.niveId })
                        )
                        return await divineResolver({ message: '添加成功' })
                    })
                }
                /**不存在好友关联记录、新增一条记录**/ //prettier-ignore
                await this.customService.divineCreate(this.customService.tableContact, {
                    headers,
                    state: {
                        uid: await divineIntNumber(),
                        status: 'enable',
                        userId: data.userId,
                        niveId: data.niveId
                    }
                }).then(async result => {
                    /**新建私聊会话**/
                    return await this.sessionService.httpSessionContactCreater(headers, {
                        contactId: result.uid
                    })
                })
                return await connect.commitTransaction().then(async () => {
                    this.logger.info(
                        [NotificationService.name, this.httpNotificationUpdate.name].join(':'),
                        divineLogger(headers, { message: '添加好友成功', userId: data.userId, niveId: data.niveId })
                    )
                    return await divineResolver({ message: '添加成功' })
                })
            }

            /**群聊申请**/
            if (data.source === 'communit' && scope.status === 'resolve') {
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

    /**通知列表**/
    public async httpNotificationColumn(headers: env.Headers, userId: string) {
        try {
            return await this.customService.divineBuilder(this.customService.tableNotification, async qb => {
                qb.leftJoinAndMapOne('t.user', entities.UserEntier, 'user', 'user.uid = t.userId')
                qb.leftJoinAndMapOne('t.nive', entities.UserEntier, 'nive', 'nive.uid = t.niveId')
                qb.select([
                    ...divineSelection('t', ['keyId', 'uid', 'createTime', 'updateTime']),
                    ...divineSelection('t', ['source', 'userId', 'niveId', 'communitId', 'status']),
                    ...divineSelection('user', ['uid', 'nickname', 'avatar', 'status']),
                    ...divineSelection('nive', ['uid', 'nickname', 'avatar', 'status'])
                ])
                qb.where('t.userId = :userId OR t.niveId = :userId', { userId })
                return await qb.getManyAndCount().then(async ([list = [], total = 0]) => {
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
