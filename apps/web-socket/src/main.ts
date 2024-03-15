import { NestFactory } from '@nestjs/core';
import { WebsocketModule } from './websocket.module';

async function bootstrap() {
  const app = await NestFactory.create(WebsocketModule);
  await app.listen(3000);
}
bootstrap();
