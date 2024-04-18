import { Inject, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@/guards/auth.guard'
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets'
import { SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { WebSocketClientService } from '@web-socket/services/web-socket.client.service'
import { WebSocketService } from '@web-socket/services/web-socket.service'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'

@WebSocketGateway(web.WEB_SOCKET_PORT, {
    cors: { origin: '*' },
    transport: ['websocket'],
    pingInterval: 10000,
    pingTimeout: 15000
})
export class WebSocketEventGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly webSocketClientService: WebSocketClientService,
        private readonly webSocketService: WebSocketService
    ) {}

    public async afterInit(@ConnectedSocket() socket: env.AuthSocket) {
        console.log('[web-socket]服务启动:', `ws://localhost:${web.WEB_SOCKET_PORT}`)
    }

    public async handleConnection(@ConnectedSocket() socket: env.AuthSocket) {
        console.log('客户端已连接:', socket.id, socket.user)
        // client.emit('connect', { message: '连接成功' })
    }

    public async handleDisconnect(@ConnectedSocket() socket: env.AuthSocket) {}

    @SubscribeMessage('sender')
    subscribeSender(@ConnectedSocket() socket: env.AuthSocket, @MessageBody() data: { name: string }) {
        console.log('body:', data, socket)
        // console.log('client:', client)
        return {
            event: 'sender',
            data: data
        }
    }

    /**社群消息**/
    @SubscribeMessage('communit-messager')
    public fetchCommunitMessager(@ConnectedSocket() socket: env.AuthSocket, @MessageBody() data: { name: string }) {}

    /**私聊消息**/
    @UseGuards(AuthGuard)
    @SubscribeMessage('private-messager')
    public fetchPrivateMessager(@ConnectedSocket() socket: env.AuthSocket, @MessageBody() data: { name: string }) {
        console.log('private-sender:', data, socket.handshake.headers)
        // console.log('client:', client)
        return {
            event: 'private-sender',
            data: data
        }
    }
}
