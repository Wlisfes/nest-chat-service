import { Module } from '@nestjs/common'
import { ConfigerModule } from '@/modules/configer.module'
import { LoggerModule } from '@/modules/logger.module'
import { RedisModule } from '@/modules/redis.module'
import { DatabaseModule } from '@/modules/database.module'
import { RabbitmqModule } from '@/modules/rabbitmq.module'
import { WebCustomizeMessagerService } from '@web-scheduler/web.customize-messager.service'

@Module({
    imports: [LoggerModule.forRoot({ name: 'web-scheduler' }), ConfigerModule, RedisModule, DatabaseModule, RabbitmqModule],
    controllers: [],
    providers: [WebCustomizeMessagerService]
})
export class WebSchedulerModule {}
