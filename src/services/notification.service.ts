import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { LoggerService, Logger } from '@/services/logger.service'
import { CustomService } from '@/services/custom.service'
import { UserService } from '@/services/user.service'
import { MessagerService } from '@/services/messager.service'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineClientSender } from '@/utils/utils-microservices'
import { divineResolver, divineIntNumber, divineHandler, divineParameter } from '@/utils/utils-common'
import { divineSelection } from '@/utils/utils-typeorm'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class NotificationService extends LoggerService {
    constructor(
        @Inject('WEB-SOCKET') private socketClient: ClientProxy,
        private readonly customService: CustomService,
        private readonly userService: UserService,
        private readonly messagerService: MessagerService
    ) {
        super()
    }

    /**通知列表**/
    @Logger
    public async httpNotificationColumn(headers: env.Headers, userId: string) {
        return await this.customService.divineBuilder(this.customService.tableNotification, async qb => {
            /**好友申请记录联查**/
            qb.leftJoinAndMapOne('t.user', entities.UserEntier, 'user', 'user.uid = t.userId')
            qb.leftJoinAndMapOne('t.nive', entities.UserEntier, 'nive', 'nive.uid = t.niveId')
            /**社群申请记录联查**/
            qb.leftJoinAndMapOne('t.communit', entities.CommunitEntier, 'communit', 'communit.uid = t.communitId')
            qb.leftJoinAndMapOne('communit.own', entities.UserEntier, 'own', 'communit.ownId = own.uid')
            qb.leftJoinAndMapOne('communit.poster', entities.MediaEntier, 'poster', 'communit.poster = poster.fileId')
            qb.select([
                ...divineSelection('t', ['keyId', 'uid', 'createTime', 'updateTime', 'source']),
                ...divineSelection('t', ['userId', 'niveId', 'json', 'communitId', 'status', 'command']),
                ...divineSelection('user', ['uid', 'nickname', 'avatar', 'status', 'comment']),
                ...divineSelection('nive', ['uid', 'nickname', 'avatar', 'status', 'comment']),
                ...divineSelection('communit', ['keyId', 'uid', 'name', 'poster', 'ownId', 'status', 'comment']),
                ...divineSelection('own', ['uid', 'nickname', 'avatar', 'status', 'comment']),
                ...divineSelection('poster', ['width', 'height', 'fileId', 'fileURL'])
            ])
            qb.orderBy('t.updateTime', 'DESC')
            qb.where(
                `((t.userId = :userId OR t.niveId = :userId) AND t.source = :contact)
                    OR
                 ((t.userId = :userId OR communit.ownId = :userId) AND t.source = :communit AND communit.status = :status)
                `,
                {
                    contact: entities.EnumNotificationSource.contact,
                    communit: entities.EnumNotificationSource.communit,
                    status: entities.EnumCommunitStatus.enable,
                    userId
                }
            )
            return await qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                return await divineResolver({ total, list })
            })
        })
    }

    /**更新通知状态**/
    @Logger
    public async httpNotificationUpdate(headers: env.Headers, userId: string, scope: env.BodyNotificationUpdate) {
        const connect = await this.customService.divineConnectTransaction()
        try {
            return await this.customService.divineBuilder(this.customService.tableNotification, async qb => {
                qb.where('t.uid = :uid', { uid: scope.uid })
                return qb.getOne().then(async node => {
                    this.logger.info({ message: `[${this.customService.tableNotification.metadata.name}]:查询出参`, node })
                    await divineCatchWherer(!Boolean(node), {
                        message: 'UID不存在'
                    })
                    await divineCatchWherer(scope.status === entities.EnumNotificationStatus.waitze, {
                        message: '通知状态参数格式错误'
                    })
                    await divineCatchWherer(node.status !== entities.EnumNotificationStatus.waitze, {
                        message: '通知信息已处理，不可再次操作'
                    })
                    if (node.source === entities.EnumNotificationSource.contact) {
                        /**好友申请**/
                        await divineCatchWherer(!node.command.includes(userId), {
                            message: '申请者不可操作'
                        })
                        return await this.httpNotificationContactUpdate(headers, {
                            userId: node.userId,
                            niveId: node.niveId,
                            status: scope.status,
                            notifyId: node.uid
                        }).then(async ({ message }) => {
                            await connect.commitTransaction()
                            return await divineResolver({ message: message })
                        })
                    } else {
                        /**群聊申请、验证社群状态**/
                        await this.customService.divineBuilder(this.customService.tableCommunit, async qb => {
                            qb.where('t.uid = :uid', { uid: node.communitId })
                            return qb.getOne().then(async data => {
                                await divineCatchWherer(!Boolean(data), {
                                    message: 'UID不存在'
                                })
                                await divineCatchWherer(Boolean(data) && data.status === entities.EnumCommunitStatus.dissolve, {
                                    message: '社群已解散'
                                })
                                await divineCatchWherer(data.ownId !== userId, {
                                    message: '权限不足、无法审核操作'
                                })
                                return await divineResolver(data)
                            })
                        })
                        return await this.httpNotificationCommunitUpdate(headers, {
                            status: scope.status,
                            userId: node.userId,
                            communitId: node.communitId,
                            notifyId: node.uid
                        }).then(async ({ message }) => {
                            await connect.commitTransaction()
                            return await divineResolver({ message: message })
                        })
                    }
                })
            })
        } catch (e) {
            await connect.rollbackTransaction()
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        } finally {
            await connect.release()
        }
    }

    /**更新好友申请通知状态**/
    @Logger
    public async httpNotificationContactUpdate(headers: env.Headers, scope: env.BodyNotificationContactUpdate) {
        if (scope.status === entities.EnumNotificationStatus.reject) {
            /**拒绝添加好友**/
            this.logger.info({ message: '拒绝添加好友', scope })
            return await divineResolver({ message: '拒绝成功' })
        }
        /**同意添加好友**/
        return await this.customService.divineBuilder(this.customService.tableContact, async qb => {
            qb.where('(t.userId = :userId AND t.niveId = :niveId) OR (t.userId = :niveId AND t.userId = :userId)', {
                userId: scope.userId,
                niveId: scope.niveId
            })
            return qb.getOne().then(async node => {
                /**输出记录日志**/
                await divineHandler(Boolean(node), {
                    handler: () => this.logger.info({ message: '存在好友关联记录', node })
                })
                const data = await divineParameter(scope).then(async ({ userId, niveId }) => {
                    const { nickname } = await this.userService.httpUserResolver(headers, scope.userId)
                    if (Boolean(node)) {
                        /**存在好友关联记录**/
                        await this.customService.divineUpdate(this.customService.tableContact, {
                            headers,
                            where: { keyId: node.keyId },
                            state: {
                                userId: scope.userId,
                                niveId: scope.niveId,
                                status: entities.EnumContactStatus.enable
                            }
                        })
                        /**查询会话数据**/
                        return await this.customService.divineBuilder(this.customService.tableSession, async qb => {
                            qb.where('t.contactId = :contactId AND t.source = :source', {
                                source: entities.EnumSessionSource.contact,
                                contactId: node.uid
                            })
                            return qb.getOne().then(({ sid }) => {
                                return { userId, niveId, nickname, contactId: node.uid, sessionId: sid }
                            })
                        })
                    } else {
                        /**不存在好友关联记录**/
                        const sid = await divineIntNumber()
                        const cid = await divineIntNumber()
                        /**新增好友绑定记录**/
                        await this.customService.divineCreate(this.customService.tableContact, {
                            headers,
                            state: { uid: cid, userId, niveId, status: entities.EnumContactStatus.enable }
                        })
                        /**新增好友会话记录**/
                        await this.customService.divineCreate(this.customService.tableSession, {
                            headers,
                            state: { contactId: cid, sid: sid, source: entities.EnumSessionSource.contact }
                        })
                        return { userId, niveId, nickname, contactId: cid, sessionId: sid }
                    }
                })
                /**更新通知状态**/
                await this.customService.divineUpdate(this.customService.tableNotification, {
                    headers,
                    where: { uid: scope.notifyId },
                    state: { status: scope.status }
                })
                /**Socket推送通知消息**/
                await divineClientSender(this.socketClient, {
                    eventName: 'web-socket-push-notification',
                    headers,
                    state: { notifyId: scope.notifyId, userId: scope.userId }
                })
                /**新增用户Socket会话房间**/
                await divineClientSender(this.socketClient, {
                    eventName: 'web-socket-refresh-session',
                    headers,
                    state: { userId: data.userId, sid: data.sessionId }
                })
                /**新增用户Socket会话房间**/
                await divineClientSender(this.socketClient, {
                    eventName: 'web-socket-refresh-session',
                    headers,
                    state: { userId: data.niveId, sid: data.sessionId }
                })
                /**插入申请用户招呼记录**/
                await this.messagerService.httpCommonCustomizeMessager(headers, data.userId, {
                    source: entities.EnumMessagerSource.text,
                    referrer: entities.EnumMessagerReferrer.http,
                    sessionId: data.sessionId,
                    text: `我是${data.nickname}`,
                    fileId: ''
                })
                /**插入被申请用户招呼记录**/
                await this.messagerService.httpCommonCustomizeMessager(headers, data.niveId, {
                    source: entities.EnumMessagerSource.text,
                    referrer: entities.EnumMessagerReferrer.http,
                    sessionId: data.sessionId,
                    text: `我通过了您的好友申请，现在我们可以聊天了`,
                    fileId: ''
                })
                return await divineResolver({ message: '添加成功' })
            })
        })
    }

    /**更新社群申请通知状态**/
    @Logger
    public async httpNotificationCommunitUpdate(headers: env.Headers, scope: env.BodyNotificationCommunitUpdate) {
        if (scope.status === entities.EnumNotificationStatus.reject) {
            /**拒绝加入社群**/
            this.logger.info({ message: '拒绝加入社群', scope })
            return await divineResolver({ message: '拒绝成功' })
        }
        /**同意加入社群**/
        return await this.customService.divineBuilder(this.customService.tableCommunitMember, async qb => {
            qb.where('t.userId = :userId AND t.communitId = :communitId', {
                communitId: scope.communitId,
                userId: scope.userId
            })
            return qb.getOne().then(async node => {
                /**输出记录日志**/
                await divineHandler(Boolean(node), {
                    handler: () => this.logger.info({ message: '存在社群成员关联记录', node })
                })
                const data = await divineParameter(scope).then(async ({ userId, communitId }) => {
                    const { nickname } = await this.userService.httpUserResolver(headers, userId)
                    if (Boolean(node)) {
                        /**存在社群成员关联记录、成员角色切换成初始状态**/
                        await this.customService.divineUpdate(this.customService.tableCommunitMember, {
                            headers,
                            where: { keyId: node.keyId },
                            state: { status: entities.EnumContactStatus.enable, speak: false }
                        })
                        /**查询会话数据**/
                        return await this.customService.divineBuilder(this.customService.tableSession, async qb => {
                            qb.where('t.communitId = :communitId AND t.source = :source', {
                                source: entities.EnumSessionSource.communit,
                                communitId: communitId
                            })
                            return qb.getOne().then(({ sid }) => {
                                return { userId, nickname, communitId, sessionId: sid }
                            })
                        })
                    } else {
                        /**不存在社群成员关联记录、新增社群成员关联记录**/
                        await this.customService.divineCreate(this.customService.tableCommunitMember, {
                            headers,
                            state: {
                                status: entities.EnumContactStatus.enable,
                                userId: userId,
                                communitId: communitId,
                                speak: false
                            }
                        })
                        /**查询会话数据**/
                        return await this.customService.divineBuilder(this.customService.tableSession, async qb => {
                            qb.where('t.communitId = :communitId AND t.source = :source', {
                                source: entities.EnumSessionSource.communit,
                                communitId: communitId
                            })
                            return qb.getOne().then(({ sid }) => {
                                return { userId, nickname, communitId, sessionId: sid }
                            })
                        })
                    }
                })
                /**更新通知状态**/
                await this.customService.divineUpdate(this.customService.tableNotification, {
                    headers,
                    where: { uid: scope.notifyId },
                    state: { status: scope.status }
                })
                /**Socket推送通知消息**/
                await divineClientSender(this.socketClient, {
                    eventName: 'web-socket-push-notification',
                    headers,
                    state: { notifyId: scope.notifyId, userId: scope.userId }
                })
                /**新增用户Socket会话房间**/
                await divineClientSender(this.socketClient, {
                    eventName: 'web-socket-refresh-session',
                    headers,
                    state: { userId: data.userId, sid: data.sessionId }
                })
                /**插入被申请用户招呼记录**/
                await this.messagerService.httpCommonCustomizeMessager(headers, data.userId, {
                    source: entities.EnumMessagerSource.text,
                    referrer: entities.EnumMessagerReferrer.http,
                    sessionId: data.sessionId,
                    text: `${data.nickname}加入了社群`,
                    fileId: ''
                })
                return await divineResolver({ message: '添加成功' })
            })
        })
    }
}
