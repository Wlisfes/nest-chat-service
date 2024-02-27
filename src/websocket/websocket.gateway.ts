import { WebSocketGateway, SubscribeMessage, WebSocketServer, ConnectedSocket, MessageBody } from '@nestjs/websockets'
import { Observable } from 'rxjs'
import { Server, Socket } from 'socket.io'

@WebSocketGateway(34577, {
    cors: { origin: '*' },
    transport: ['websocket']
})
export class WebSocketEventGateway {
    @WebSocketServer() private readonly server: Server

    afterInit(@ConnectedSocket() client: Socket) {
        console.log('WebSocket服务启动:', `ws://localhost:34577`)
    }

    handleDisconnect(@ConnectedSocket() client: Socket) {}

    handleConnection(@ConnectedSocket() client: Socket) {
        console.log('客户端已连接:')
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
