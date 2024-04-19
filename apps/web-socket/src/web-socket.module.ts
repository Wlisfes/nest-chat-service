import { Module } from '@nestjs/common'
import { ConfigerModule } from '@/modules/configer.module'
import { LoggerModule } from '@/modules/logger.module'
import { RedisModule } from '@/modules/redis.module'
import { DatabaseModule } from '@/modules/database.module'
import { RabbitmqModule } from '@/modules/rabbitmq.module'
import { SessionService } from '@/services/session.service'
import { MessagerService } from '@/services/messager.service'
import { WebSocketController } from '@web-socket/web-socket.controller'
import { WebSocketClientService } from '@web-socket/services/web-socket.client.service'
import { WebSocketService } from '@web-socket/services/web-socket.service'
import { WebSocketEventGateway } from '@web-socket/web-socket.gateway'
import { WebSocketMessagerService } from '@web-socket/services/web.socket-messager.service'
import { WebSocketChangeMessagerService } from '@web-socket/services/web.socket-change-messager.service'

@Module({
    imports: [LoggerModule.forRoot({ name: 'web-socket' }), ConfigerModule, RedisModule, DatabaseModule, RabbitmqModule],
    controllers: [WebSocketController],
    providers: [
        SessionService,
        MessagerService,
        WebSocketClientService,
        WebSocketService,
        WebSocketEventGateway,
        WebSocketMessagerService,
        WebSocketChangeMessagerService
    ]
})
export class WebSocketModule {}
