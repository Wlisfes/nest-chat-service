import { Module } from '@nestjs/common'
import { ConfigerModule } from '@/modules/configer.module'
import { LoggerModule } from '@/modules/logger.module'
import { RedisModule } from '@/modules/redis.module'
import { DatabaseModule } from '@/modules/database.module'
import { RabbitmqModule } from '@/modules/rabbitmq.module'
import { WebConsumerService } from '@web-scheduler/web.consumer.service'

@Module({
    imports: [LoggerModule.forRoot({ name: 'web-scheduler' }), RabbitmqModule, ConfigerModule, RedisModule, DatabaseModule],
    controllers: [],
    providers: [WebConsumerService]
})
export class WebSchedulerModule {}
