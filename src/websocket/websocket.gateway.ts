import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets'
import { Observable } from 'rxjs'
import { Server } from 'socket.io'

@WebSocketGateway(34577, {
    cors: { origin: '*' }
})
export class WebSocketEventGateway {
    afterInit(server: Server) {
        console.log('WebSocket服务启动:', `ws://localhost:34577`)
    }

    handleDisconnect(server: Server) {}

    handleConnection(server: Server, ...args: any[]) {
        console.log(...args)
    }
}
