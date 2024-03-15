import { Module } from '@nestjs/common';
import { WebsocketController } from './websocket.controller';
import { WebsocketService } from './websocket.service';

@Module({
  imports: [],
  controllers: [WebsocketController],
  providers: [WebsocketService],
})
export class WebsocketModule {}
