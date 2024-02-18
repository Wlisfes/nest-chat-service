import { Module } from '@nestjs/common'
import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from '@/modules/logger.module'
import { DatabaseModule } from '@/modules/database.module'

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), LoggerModule, DatabaseModule],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
