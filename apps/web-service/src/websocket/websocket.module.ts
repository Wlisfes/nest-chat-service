import { Module } from '@nestjs/common'
import { WebSocketEventGateway } from '@/websocket/websocket.gateway'

@Module({
    providers: [WebSocketEventGateway]
})
export class WebSocketModule {}
