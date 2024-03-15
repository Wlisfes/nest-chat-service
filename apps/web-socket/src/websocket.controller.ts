import { Controller, Get } from '@nestjs/common';
import { WebsocketService } from './websocket.service';

@Controller()
export class WebsocketController {
  constructor(private readonly websocketService: WebsocketService) {}

  @Get()
  getHello(): string {
    return this.websocketService.getHello();
  }
}
