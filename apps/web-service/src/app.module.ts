import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core'
import { AuthGuard } from '@/guards/auth.guard'
import { TransformInterceptor } from '@/interceptor/transform.interceptor'
import { HttpExceptionFilter } from '@/filter/http-exception.filter'
import { ConfigerModule } from '@/modules/configer.module'
import { LoggerModule } from '@/modules/logger.module'
import { RedisModule } from '@/modules/redis.module'
import { DatabaseModule } from '@/modules/database.module'
import { NodemailerModule } from '@/modules/nodemailer.module'
import { UserService } from '@/services/user/user.service'
import { CommonService } from '@/services/common/common.service'
import { AppService } from '@web-service/app.service'
import { AppController } from '@web-service/app.controller'
import { UserController } from '@web-service/controllers/user.controller'
import { CommonController } from '@web-service/controllers/common.controller'

@Module({
    imports: [ConfigerModule, LoggerModule, RedisModule, DatabaseModule, NodemailerModule],
    controllers: [AppController, UserController, CommonController],
    providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        AppService,
        CommonService,
        UserService
    ]
})
export class AppModule {}
