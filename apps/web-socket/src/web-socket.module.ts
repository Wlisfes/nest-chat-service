import { Module } from '@nestjs/common'
import { ConfigerModule } from '@/modules/configer.module'
import { LoggerModule } from '@/modules/logger.module'
import { RedisModule } from '@/modules/redis.module'
import { DatabaseModule } from '@/modules/database.module'
import { RabbitmqModule } from '@/modules/rabbitmq.module'
import { WebSocketController } from '@web-socket/web-socket.controller'
import { WebSocketService } from '@web-socket/web-socket.service'
import { WebSocketEventGateway } from '@web-socket/web-socket.gateway'

@Module({
    imports: [LoggerModule.forRoot({ name: 'web-socket' }), ConfigerModule, RedisModule, DatabaseModule, RabbitmqModule],
    controllers: [WebSocketController],
    providers: [WebSocketService, WebSocketEventGateway]
})
export class WebSocketModule {}
