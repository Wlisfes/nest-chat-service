import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core'
import { LoggerMiddleware } from '@/middleware/logger.middleware'
import { AuthGuard } from '@/guards/auth.guard'
import { TransformInterceptor } from '@/interceptor/transform.interceptor'
import { HttpExceptionFilter } from '@/filter/http-exception.filter'
import { ConfigerModule } from '@/modules/configer.module'
import { LoggerModule } from '@/modules/logger.module'
import { ThrottlerModule } from '@/modules/throttler.module'
import { RedisModule } from '@/modules/redis.module'
import { DatabaseModule } from '@/modules/database.module'
import { NodemailerModule } from '@/modules/nodemailer.module'
import { UploaderModule } from '@/modules/uploader.module'
import { CommonService } from '@/services/common.service'
import { UserService } from '@/services/user.service'
import { CommunitService } from '@/services/communit.service'
import { ContactService } from '@/services/contact.service'
import { SessionService } from '@/services/session.service'
import { AppService } from '@web-service/app.service'
import { AppController } from '@web-service/app.controller'
import { CommonController } from '@web-service/controllers/common.controller'
import { UserController } from '@web-service/controllers/user.controller'
import { CommunitController } from '@web-service/controllers/communit.controller'
import { ContactController } from '@web-service/controllers/contact.controller'
import { SessionController } from '@web-service/controllers/session.controller'
import { UploaderController } from '@web-service/controllers/uploader.controller'

@Module({
    imports: [
        LoggerModule.forRoot({ name: 'web-service' }),
        ConfigerModule,
        ThrottlerModule,
        RedisModule,
        DatabaseModule,
        NodemailerModule,
        UploaderModule
    ],
    controllers: [
        AppController,
        CommonController,
        UserController,
        CommunitController,
        ContactController,
        SessionController,
        UploaderController
    ],
    providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        AppService,
        CommonService,
        UserService,
        CommunitService,
        ContactService,
        SessionService
    ]
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*')
    }
}
