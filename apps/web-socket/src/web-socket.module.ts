import { Module } from '@nestjs/common'
import { WebSocketController } from '@web-socket/web-socket.controller'
import { WebSocketService } from '@web-socket/web-socket.service'
import { WebSocketEventGateway } from '@web-socket/web-socket.gateway'

@Module({
    imports: [],
    controllers: [WebSocketController],
    providers: [WebSocketEventGateway, WebSocketService]
})
export class WebSocketModule {}
