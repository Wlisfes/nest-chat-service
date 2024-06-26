import { Injectable, HttpStatus } from '@nestjs/common'
import { LoggerService, Logger } from '@/services/logger.service'
import { RedisService } from '@/services/redis/redis.service'
import { RabbitmqService } from '@/services/rabbitmq.service'
import { MessagerService } from '@/services/messager.service'
import { WebSocketDataBaseService } from '@web-socket/services/web-socket.database.service'
import { WebSocketClientService } from '@web-socket/services/web-socket.client.service'
import { divineResolver, divineHandler, divineKeyCompose, divineParameter } from '@/utils/utils-common'
import { divineCatchWherer } from '@/utils/utils-plugin'
import * as web from '@/config/web-instance'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class WebSocketService extends LoggerService {
    constructor(
        private readonly webSocketClientService: WebSocketClientService,
        private webSocketDataBaseService: WebSocketDataBaseService,
        private readonly rabbitmqService: RabbitmqService,
        private readonly redisService: RedisService,
        private readonly messagerService: MessagerService
    ) {
        super()
    }

    /**初始化连接、开启会话房间**/
    @Logger
    public async httpSocketConnection(headers: env.Headers, socket: env.AuthSocket, userId: string) {
        try {
            this.logger.info({ message: '开启长连接-初始化开始', socketId: socket.id, user: socket.user })
            await this.webSocketDataBaseService.fetchSocketColumnSession(headers, userId).then(async sessions => {
                socket.join(sessions)
                this.logger.info({ message: '初始化用户会话房间', socketId: socket.id, user: socket.user, sessions })
                return await divineResolver(sessions)
            })
            /**存储当前用户socket实例**/
            return await this.webSocketClientService.setClient(socket.user.uid, socket)
        } catch (e) {}
    }

    /**Socket发送自定义消息、消息推入MQ队列**/
    @Logger
    public async httpSocketCustomizeMessager(headers: env.Headers, userId: string, scope: env.BodyCheckCustomizeMessager) {
        try {
            const node = await this.messagerService.httpCommonCustomizeMessager(headers, userId, {
                ...scope,
                referrer: entities.EnumMessagerReferrer.socket
            })
            return await divineResolver({ ...node, status: HttpStatus.OK })
        } catch (e) {
            return await divineResolver({
                message: e.message,
                status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR
            })
        }
    }

    /**Socket已读消息操作、消息推入MQ队列**/
    @Logger
    public async httpSocketChangeMessager(headers: env.Headers, scope: env.BodySocketChangeMessager) {
        try {
            await this.rabbitmqService.despatchSocketChangeMessager(headers, scope)
            return await divineResolver({ message: '操作成功', status: HttpStatus.OK })
        } catch (e) {
            return await divineResolver({
                message: e.message,
                status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR
            })
        }
    }

    /**用户临时加入会话房间**/
    @Logger
    public async httpSocketJoinSession(headers: env.Headers, scope: { userId: string; sid: string }) {
        try {
            const socket = await this.webSocketClientService.getClient(scope.userId)
            const pidSessionId = `${process.pid}-${scope.sid}`
            return await divineHandler(Boolean(socket) && socket.connected, {
                failure: async () => {
                    this.logger.info({ message: '用户不在线', node: scope })
                    return await divineResolver({ message: '用户不在线', status: HttpStatus.OK })
                },
                handler: async () => {
                    socket.join(pidSessionId)
                    this.logger.info({ message: '会话房间加入成功', socketId: socket.id, user: socket.user, sid: scope.sid })
                    return await divineResolver({ message: '会话房间加入成功', status: HttpStatus.OK })
                }
            })
        } catch (e) {
            return await divineResolver({ message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
        }
    }

    /**查询会话消息列表**/
    public async httpSocketSessionColumnMessager(headers: env.Headers, userId: string, scope: env.QuerySessionColumnMessager) {
        return await divineResolver({
            message: '请求成功',
            code: HttpStatus.OK,
            data: await this.messagerService.httpSessionColumnMessager(headers, userId, scope)
        })
    }

    /**Socket推送消息至客户端**/
    @Logger
    public async httpSocketPushCustomizeMessager(headers: env.Headers, scope: env.Omix<env.BodySocketPushCustomizeMessager>) {
        try {
            this.logger.info({ message: 'Socket推送消息至客户端-开始推送', data: scope })
            /**获取消息详情、执行socket推送**/
            const message = await this.webSocketDataBaseService.fetchMessagerResolver(headers, { sid: scope.sid })
            const rooms = this.webSocketClientService.server.sockets.adapter.rooms
            const pidSessionId = `${process.pid}-${scope.sessionId}`
            if (!Boolean(message)) {
                this.logger.info({ message: 'Socket推送消息至客户端-推送失败：消息不存在', data: scope })
                return await divineResolver({ message: '推送失败', ...scope })
            } else if (!rooms.get(pidSessionId)) {
                this.logger.info({ message: 'Socket推送消息至客户端-推送失败：会话SID用户未在线', data: scope })
                return await divineResolver({ message: '推送失败', ...scope })
            } else {
                const sockets = this.webSocketClientService.server.sockets
                const eventName = `server-customize-messager`
                const typeName = `server-change-messager`
                if (scope.referrer === entities.EnumMessagerReferrer.socket) {
                    /**消息来源是socket**/
                    const socket = await this.webSocketClientService.getClient(scope.userId)
                    if (Boolean(socket) && socket.connected) {
                        /**如果发送者在线、除了发送者其他房间用户都推送过去**/
                        sockets.to(pidSessionId).except(socket.id).emit(eventName, message)
                        socket.emit(scope.sid, {
                            type: typeName,
                            state: {
                                reason: null,
                                sid: scope.sid,
                                status: entities.EnumMessagerStatus.delivered
                            }
                        })
                    } else {
                        /**如果发送者不在线、全量推送**/
                        sockets.to(pidSessionId).emit(eventName, message)
                    }
                    this.logger.info({ message: 'Socket推送消息至客户端-推送成功', data: scope })
                } else {
                    /**其他来源**/
                    sockets.to(pidSessionId).emit(eventName, message)
                    this.logger.info({ message: 'Socket推送消息至客户端-全量推送成功', data: scope })
                }
                return await divineResolver({ message: '推送成功', ...scope })
            }
        } catch (e) {
            return await divineResolver({ message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
        }
    }

    /**Socket推送消息状态变更至客户端**/
    @Logger
    public async httpSocketPushChangeMessager(headers: env.Headers, scope: env.Omix<env.BodySocketChangeMessager>) {
        try {
            this.logger.info({ message: 'Socket推送消息状态变更至客户端-开始推送', data: scope })
            const sockets = this.webSocketClientService.server.sockets
            const socket = await this.webSocketClientService.getClient(scope.userId)
            const typeName = `server-read-messager`
            const pidSessionId = `${process.pid}-${scope.sessionId}`
            await divineHandler(Boolean(socket) && socket.connected, {
                handler: () => {
                    /**排除读取用户推送**/
                    sockets.to(pidSessionId).except(socket.id).emit(scope.sid, { type: typeName, state: scope })
                },
                failure: () => {
                    /**根据会话SID全量推送**/
                    sockets.to(pidSessionId).emit(scope.sid, { type: typeName, state: scope })
                }
            })
            this.logger.info({ message: 'Socket推送消息状态变更至客户端-推送成功', data: scope })
            return await divineResolver({ message: '推送成功', ...scope })
        } catch (e) {
            this.logger.error({
                message: `Socket推送消息状态变更至客户端失败: ${e.message}`,
                status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
                data: scope
            })
            return await divineResolver({ message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
        }
    }

    /**Socket推送操作通知消息至客户端**/
    @Logger
    public async httpSocketPushNotification(headers: env.Headers, scope: env.Omix<{ userId: string; notifyId: string }>) {
        try {
            const socket = await this.webSocketClientService.getClient(scope.userId)
            const typeName = `server-notification-messager`
            return await divineHandler(Boolean(socket) && socket.connected, {
                failure: async () => {
                    this.logger.info({ message: '用户不在线', node: scope })
                    return await divineResolver({ message: '用户不在线', status: HttpStatus.OK })
                },
                handler: async () => {
                    return await this.webSocketDataBaseService.fetchNotificationResolver(headers, scope.notifyId).then(async node => {
                        if (Boolean(node)) {
                            socket.emit(typeName, node)
                            this.logger.info({ message: 'Socket推送操作通知消息至客户端成功', node })
                        }
                        return await divineResolver({ message: '通知消息推送成功', status: HttpStatus.OK })
                    })
                }
            })
        } catch (e) {
            this.logger.error({
                message: `Socket推送操作通知消息至客户端失败: ${e.message}`,
                status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
                data: scope
            })
            return await divineResolver({ message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
        }
    }

    /**远程呼叫查询**/
    @Logger
    public async httpSocketCallRemoteResolver(headers: env.Headers, userId: string, scope: env.BodySocketCallRemoteResolver) {
        try {
            const IS_Contact = scope.source === entities.EnumSessionSource.contact
            const IS_Communit = scope.source === entities.EnumSessionSource.communit
            await divineCatchWherer(IS_Contact && !scope.contactId, {
                message: '好友绑定关系ID必填'
            })
            await divineCatchWherer(IS_Communit && !scope.contactId, {
                message: '社群ID必填'
            })
            const data = (await this.messagerService.httpCheckSessionBinder(headers, userId, scope.sid)) as env.Omix<entities.SessionEntier>
            const contact = data.contact as env.Omix<entities.ContactEntier>
            const communit = data.communit as env.Omix<entities.CommunitEntier>
            if (IS_Contact) {
                const user = await divineParameter<entities.UserEntier>(contact.user).then(async ({ uid, nickname, status, avatar }) => {
                    const keyName = await divineKeyCompose(web.CHAT_CHAHE_USER_ONLINE, uid)
                    const socketName = await divineKeyCompose(web.CHAT_CHAHE_USER_SOCKET, uid)
                    const online = await this.redisService.getStore(headers, { key: keyName, defaultValue: false, logger: false })
                    const socketId = await this.redisService.getStore(headers, { key: socketName, defaultValue: null, logger: false })
                    return { uid, nickname, status, avatar, online, socketId }
                })
                const nive = await divineParameter<entities.UserEntier>(contact.nive).then(async ({ uid, nickname, status, avatar }) => {
                    const keyName = await divineKeyCompose(web.CHAT_CHAHE_USER_ONLINE, uid)
                    const socketName = await divineKeyCompose(web.CHAT_CHAHE_USER_SOCKET, uid)
                    const online = await this.redisService.getStore(headers, { key: keyName, defaultValue: false, logger: false })
                    const socketId = await this.redisService.getStore(headers, { key: socketName, defaultValue: null, logger: false })
                    return { uid, nickname, status, avatar, online, socketId }
                })
                return await divineResolver({
                    message: '查询成功',
                    code: HttpStatus.OK,
                    data: { user, nive }
                })
            } else if (IS_Communit) {
                const keyName = await divineKeyCompose(web.CHAT_CHAHE_COMMUNIT_CALL, communit.uid)
                return await divineResolver({
                    message: '查询成功',
                    code: HttpStatus.OK,
                    data: {
                        communit: await this.redisService.getStore(headers, { key: keyName, defaultValue: [], logger: false })
                    }
                })
            }
        } catch (e) {
            return await divineResolver({
                message: e.message,
                code: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
                data: { message: e.message }
            })
        }
    }
}
