import { Module } from '@nestjs/common'
import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import { ConfigModule } from '@nestjs/config'
import { WebSocketModule } from '@/websocket/websocket.module'
import { LoggerModule } from '@/modules/logger.module'
import { DatabaseModule } from '@/modules/database.module'

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), LoggerModule, DatabaseModule, WebSocketModule],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
