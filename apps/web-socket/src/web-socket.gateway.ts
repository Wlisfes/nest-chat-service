import { Inject } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets'
import { SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { WebSocketClientService } from '@web-socket/web-socket.client.service'
import { WebSocketService } from '@web-socket/web-socket.service'
import * as web from '@/config/instance.config'

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

    public async afterInit(@ConnectedSocket() socket: Socket) {
        console.log('[web-socket]服务启动:', `ws://localhost:${web.WEB_SOCKET_PORT}`)
    }

    public async handleConnection(@ConnectedSocket() client: Socket) {
        console.log('客户端已连接:', client)
        // client.emit('connect', { message: '连接成功' })
    }

    public async handleDisconnect(@ConnectedSocket() client: Socket) {}

    @SubscribeMessage('sender')
    subscribeSender(@ConnectedSocket() client: Socket, @MessageBody() data: { name: string }) {
        console.log('body:', data)
        // console.log('client:', client)
        return {
            event: 'sender',
            data: data
        }
    }

    /**社群消息**/
    @SubscribeMessage('communit-messager')
    public fetchCommunitMessager(@ConnectedSocket() client: Socket, @MessageBody() data: { name: string }) {}

    /**私聊消息**/
    @SubscribeMessage('private-messager')
    public fetchPrivateMessager(@ConnectedSocket() client: Socket, @MessageBody() data: { name: string }) {
        console.log('private-sender:', data)
        // console.log('client:', client)
        return {
            event: 'private-sender',
            data: data
        }
    }
}
