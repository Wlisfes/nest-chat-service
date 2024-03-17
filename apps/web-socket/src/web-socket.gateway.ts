import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets'
import { SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
    cors: { origin: '*' },
    transport: ['websocket'],
    pingInterval: 10000,
    pingTimeout: 15000
})
export class WebSocketEventGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private readonly server: Server

    afterInit(@ConnectedSocket() client: Socket) {
        console.log('WebSocket服务启动:', `ws://localhost:34577`)
    }

    handleDisconnect(@ConnectedSocket() client: Socket) {}

    handleConnection(@ConnectedSocket() client: Socket) {
        console.log('客户端已连接:', client.id)
    }

    @SubscribeMessage('sender')
    subscribeSender(@ConnectedSocket() client: Socket, @MessageBody() data: { name: string }) {
        console.log('body:', data)
        // console.log('client:', client)
        return {
            event: 'sender',
            data: data
        }
    }
}
