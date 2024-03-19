import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppService } from '@web-service/app.service'
import { AppController } from '@web-service/app.controller'
import { LoggerModule } from '@/modules/logger.module'
import { DatabaseModule } from '@/modules/database.module'

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), LoggerModule, DatabaseModule],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
