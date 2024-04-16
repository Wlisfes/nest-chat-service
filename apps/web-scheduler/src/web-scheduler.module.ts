import { Module } from '@nestjs/common'
import { ConfigerModule } from '@/modules/configer.module'
import { LoggerModule } from '@/modules/logger.module'
import { RedisModule } from '@/modules/redis.module'
import { DatabaseModule } from '@/modules/database.module'

@Module({
    imports: [LoggerModule.forRoot({ name: 'web-scheduler' }), ConfigerModule, RedisModule, DatabaseModule],
    controllers: [],
    providers: []
})
export class WebSchedulerModule {}
