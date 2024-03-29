import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core'
import { TransformInterceptor } from '@/interceptor/transform.interceptor'
import { HttpExceptionFilter } from '@/filter/http-exception.filter'
import { ConfigerModule } from '@/modules/configer.module'
import { LoggerModule } from '@/modules/logger.module'
import { RedisModule } from '@/modules/redis.module'
import { DatabaseModule } from '@/modules/database.module'
import { NodemailerModule } from '@/modules/nodemailer.module'
import { UserService } from '@/services/user/user.service'
import { AppService } from '@web-service/app.service'
import { AppController } from '@web-service/app.controller'
import { UserController } from '@web-service/controllers/user.controller'

@Module({
    imports: [ConfigerModule, LoggerModule, RedisModule, DatabaseModule, NodemailerModule],
    controllers: [AppController, UserController],
    providers: [
        { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        AppService,
        UserService
    ]
})
export class AppModule {}
