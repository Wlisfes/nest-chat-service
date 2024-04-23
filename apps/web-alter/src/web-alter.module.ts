import { Module } from '@nestjs/common'
import { ConfigerModule } from '@/modules/configer.module'
import { LoggerModule } from '@/modules/logger.module'
import { RedisModule } from '@/modules/redis.module'
import { DatabaseModule } from '@/modules/database.module'
import { RabbitmqModule } from '@/modules/rabbitmq.module'
import { WebChangeMessagerService } from '@web-alter/web.change-messager.service'

@Module({
    imports: [LoggerModule.forRoot({ name: 'web-alter' }), ConfigerModule, RedisModule, DatabaseModule, RabbitmqModule],
    controllers: [],
    providers: [WebChangeMessagerService]
})
export class WebAlterModule {}
