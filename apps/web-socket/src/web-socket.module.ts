import { Module } from '@nestjs/common'
import { ConfigerModule } from '@/modules/configer.module'
import { LoggerModule } from '@/modules/logger.module'
import { RedisModule } from '@/modules/redis.module'
import { DatabaseModule } from '@/modules/database.module'
import { RabbitmqModule } from '@/modules/rabbitmq.module'
import { MessagerService } from '@/services/messager.service'
import { WebSocketController } from '@web-socket/web-socket.controller'
import { WebSocketDataBaseService } from '@web-socket/services/web-socket.database.service'
import { WebSocketClientService } from '@web-socket/services/web-socket.client.service'
import { WebSocketCommonService } from '@web-socket/services/web-socket.common.service'
import { WebSocketService } from '@web-socket/services/web-socket.service'
import { WebSocketEventGateway } from '@web-socket/web-socket.gateway'

@Module({
    imports: [LoggerModule.forRoot({ name: 'web-socket' }), ConfigerModule, RedisModule, DatabaseModule, RabbitmqModule],
    controllers: [WebSocketController],
    providers: [
        MessagerService,
        WebSocketDataBaseService,
        WebSocketClientService,
        WebSocketCommonService,
        WebSocketService,
        WebSocketEventGateway
    ]
})
export class WebSocketModule {}
