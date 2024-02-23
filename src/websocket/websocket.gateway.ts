import { WebSocketGateway, SubscribeMessage, WebSocketServer } from '@nestjs/websockets'
import { Observable } from 'rxjs'
import { Server, Socket } from 'socket.io'

@WebSocketGateway(34577, {
    cors: { origin: '*' },
    transport: ['websocket']
})
export class WebSocketEventGateway {
    afterInit(server: Server) {
        console.log('WebSocket服务启动:', `ws://localhost:34577`)
    }

    handleDisconnect(server: Server) {}

    handleConnection(server: Server, data) {
        console.log('客户端已连接:', data)
    }

    @SubscribeMessage('sender')
    subscribeSender(server: Server, data: { name: string }) {
        console.log('body', data)
        return {
            event: 'sender',
            data: data
        }
    }
}
