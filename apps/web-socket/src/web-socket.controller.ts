import { Controller } from '@nestjs/common'
import { WebSocketService } from '@web-socket/web-socket.service'

@Controller()
export class WebSocketController {
    constructor(private readonly webSocketService: WebSocketService) {}
}
