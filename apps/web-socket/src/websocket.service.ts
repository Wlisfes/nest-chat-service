import { Injectable } from '@nestjs/common';

@Injectable()
export class WebsocketService {
  getHello(): string {
    return 'Hello World!';
  }
}
