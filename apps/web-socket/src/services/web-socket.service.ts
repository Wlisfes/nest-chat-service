import { Injectable, Inject } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { RabbitmqService } from '@/services/rabbitmq.service'
import { MessagerService } from '@/services/messager.service'
import { WebSocketClientService } from '@web-socket/services/web-socket.client.service'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class WebSocketService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly rabbitmqService: RabbitmqService,
        private readonly webSocketClientService: WebSocketClientService,
        private readonly messagerService: MessagerService
    ) {}

    /**初始化当前用户的所有会话房间**/
    public async httpSocketInitialize() {}

    /**Socket发送自定义消息**/
    public async httpSocketCustomizeMessager(headers: env.Headers, userId: string, scope: env.BodyCheckCustomizeMessager) {
        return await this.messagerService.httpCommonCustomizeMessager(headers, userId, {
            ...scope,
            referrer: entities.EnumMessagerReferrer.socket
        })
    }

    /**Socket推送自定义消息**/
    public async httpSocketPushCustomizeMessager(headers: env.Headers, scope: env.Omix<entities.SchemaMessagerEntier>) {
        const sockets = this.webSocketClientService.server.sockets
        const eventName = `server-customize-messager`
        if (scope.referrer === entities.EnumMessagerReferrer.socket) {
            /**消息来源是socket: 除了发送者其他房间用户都推送**/
            const socket = await this.webSocketClientService.getClient(scope.userId)
            if (socket && socket.connected) {
                return sockets.to(scope.sessionId).except(socket.id).emit(eventName, scope)
            }
            /**发送用户不在线、直接全量推送**/
            return sockets.to(scope.sessionId).emit(eventName, scope)
        } else {
            /**其他消息来源: 给这个房间的所有用户都推送**/
            return sockets.to(scope.sessionId).emit(eventName, scope)
        }
    }
}
