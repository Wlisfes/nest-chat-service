import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core'
import { TransformInterceptor } from '@/interceptor/transform.interceptor'
import { HttpExceptionFilter } from '@/filter/http-exception.filter'
import { AppService } from '@web-service/app.service'
import { AppController } from '@web-service/app.controller'
import { ConfigerModule } from '@/modules/configer.module'
import { LoggerModule } from '@/modules/logger.module'
import { DatabaseModule } from '@/modules/database.module'

@Module({
    imports: [ConfigerModule, LoggerModule, DatabaseModule],
    controllers: [AppController],
    providers: [
        // { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        AppService
    ]
})
export class AppModule {}
