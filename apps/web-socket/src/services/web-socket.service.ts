import { Injectable, Inject, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { RabbitmqService } from '@/services/rabbitmq.service'
import { CustomService } from '@/services/custom.service'
import { SessionService } from '@/services/session.service'
import { MessagerService } from '@/services/messager.service'
import { WebSocketClientService } from '@web-socket/services/web-socket.client.service'
import { divineLogger, divineResolver } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class WebSocketService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly rabbitmqService: RabbitmqService,
        private readonly customService: CustomService,
        private readonly webSocketClientService: WebSocketClientService,
        private readonly sessionService: SessionService,
        private readonly messagerService: MessagerService
    ) {}

    /**初始化连接、开启会话房间**/
    public async httpSocketConnection(socket: env.AuthSocket, userId: string) {
        try {
            this.logger.info(
                [WebSocketService.name, this.httpSocketConnection.name].join(':'),
                divineLogger(socket.handshake.headers, { message: '开启长连接-初始化开始', socketId: socket.id, user: socket.user })
            )
            await this.sessionService.httpSocketConnection(socket.handshake.headers, userId).then(async sessions => {
                sessions.forEach(sid => {
                    socket.join(sid)
                })
                this.logger.info(
                    [WebSocketService.name, this.httpSocketConnection.name].join(':'),
                    divineLogger(socket.handshake.headers, {
                        message: '初始化用户会话房间',
                        socketId: socket.id,
                        user: socket.user,
                        sessions
                    })
                )
                return await divineResolver(sessions)
            })
            /**存储当前用户socket实例**/
            return await this.webSocketClientService.setClient(socket.user.uid, socket)
        } catch (e) {
            this.logger.error(
                [WebSocketService.name, this.httpSocketConnection.name].join(':'),
                divineLogger(socket.handshake.headers, {
                    message: e.message,
                    status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR
                })
            )
        }
    }

    /**Socket发送自定义消息**/
    public async httpSocketCustomizeMessager(headers: env.Headers, userId: string, scope: env.BodyCheckCustomizeMessager) {
        return await this.messagerService.httpCommonCustomizeMessager(headers, userId, {
            ...scope,
            referrer: entities.EnumMessagerReferrer.socket
        })
    }

    /**Socket推送自定义消息**/
    public async httpSocketPushCustomizeMessager(headers: env.Headers, scope: env.Omix<entities.SchemaMessagerEntier>) {
        try {
            this.logger.info(
                [WebSocketService.name, this.httpSocketPushCustomizeMessager.name].join(':'),
                divineLogger(headers, { message: 'Socket推送自定义消息-开始推送', data: scope })
            )
            /**获取消息详情、执行socket推送**/ //prettier-ignore
            await this.messagerService.httpSessionOneMessager(headers, {
                sid: scope.sid
            }).then(async message => {
                const sockets = this.webSocketClientService.server.sockets
                const eventName = `server-customize-messager`
                if (scope.referrer === entities.EnumMessagerReferrer.socket) {
                    /**消息来源是socket: 除了发送者其他房间用户都推送**/
                    const socket = await this.webSocketClientService.getClient(scope.userId)
                    if (socket && socket.connected) {
                        return sockets.to(scope.sessionId).except(socket.id).emit(eventName, message)
                    }
                    /**发送用户不在线、直接全量推送**/
                    return sockets.to(scope.sessionId).emit(eventName, message)
                } else {
                    /**其他消息来源: 给这个房间的所有用户都推送**/
                    return sockets.to(scope.sessionId).emit(eventName, message)
                }
            })
            this.logger.info(
                [WebSocketService.name, this.httpSocketPushCustomizeMessager.name].join(':'),
                divineLogger(headers, { message: 'Socket推送自定义消息-推送成功', data: scope })
            )
        } catch (e) {
            this.logger.error(
                [WebSocketService.name, this.httpSocketPushCustomizeMessager.name].join(':'),
                divineLogger(headers, {
                    message: `Socket推送自定义消息失败: ${e.message}`,
                    status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
                    data: scope
                })
            )
        }
    }

    /**Socket推送消息状态变更**/
    public async httpSocketPushChangeMessager(headers: env.Headers, scope: env.Omix<env.SocketChangeMessager>) {
        try {
            this.logger.info(
                [WebSocketService.name, this.httpSocketPushChangeMessager.name].join(':'),
                divineLogger(headers, { message: 'Socket推送消息状态变更-开始推送', data: scope })
            )
            const sockets = this.webSocketClientService.server.sockets
            /**根据会话SID全量推送**/
            sockets.to(scope.sessionId).emit(scope.sid, scope)
            this.logger.info(
                [WebSocketService.name, this.httpSocketPushChangeMessager.name].join(':'),
                divineLogger(headers, { message: 'Socket推送消息状态变更-推送成功', data: scope })
            )
        } catch (e) {
            this.logger.error(
                [WebSocketService.name, this.httpSocketPushChangeMessager.name].join(':'),
                divineLogger(headers, {
                    message: `Socket推送消息状态变更: ${e.message}`,
                    status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
                    data: scope
                })
            )
        }
    }
}
