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
import { CommonService } from '@/services/common.service'
import { UserService } from '@/services/user.service'
import { AppService } from '@web-service/app.service'
import { AppController } from '@web-service/app.controller'
import { CommonController } from '@web-service/controllers/common.controller'
import { UserController } from '@web-service/controllers/user.controller'

@Module({
    imports: [
        LoggerModule.forRoot({ name: 'web-service' }),
        ConfigerModule,
        ThrottlerModule,
        RedisModule,
        DatabaseModule,
        NodemailerModule
    ],
    controllers: [AppController, CommonController, UserController],
    providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        AppService,
        CommonService,
        UserService
    ]
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*')
    }
}
