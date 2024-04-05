import { Module, Global } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { ConfigService } from '@nestjs/config'
import { CLIENT_REDIS, createRedisConnect } from '@/services/redis/redis.provider'
import { RedisService } from '@/services/redis/redis.service'

@Global()
@Module({
    imports: [ScheduleModule.forRoot()],
    controllers: [],
    providers: [
        {
            provide: CLIENT_REDIS,
            inject: [ConfigService],
            async useFactory(config: ConfigService) {
                return await createRedisConnect({
                    host: config.get('REDIS_HOST'),
                    port: config.get('REDIS_PORT'),
                    password: config.get('REDIS_PASSWORD'),
                    db: config.get('REDIS_DB')
                })
            }
        },
        RedisService
    ],
    exports: [RedisService]
})
export class RedisModule {}
