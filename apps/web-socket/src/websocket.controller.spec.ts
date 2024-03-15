import { Test, TestingModule } from '@nestjs/testing';
import { WebsocketController } from './websocket.controller';
import { WebsocketService } from './websocket.service';

describe('WebsocketController', () => {
  let websocketController: WebsocketController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WebsocketController],
      providers: [WebsocketService],
    }).compile();

    websocketController = app.get<WebsocketController>(WebsocketController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(websocketController.getHello()).toBe('Hello World!');
    });
  });
});
