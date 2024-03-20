import { Module } from '@nestjs/common'
import { AppService } from '@web-service/app.service'
import { AppController } from '@web-service/app.controller'
import { ConfigerModule } from '@/modules/configer.module'
import { LoggerModule } from '@/modules/logger.module'
import { DatabaseModule } from '@/modules/database.module'

@Module({
    imports: [ConfigerModule, LoggerModule, DatabaseModule],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
