import { Controller } from '@nestjs/common'
import { WebSocketService } from '@web-socket/services/web-socket.service'

@Controller()
export class WebSocketController {
    constructor(private readonly webSocketService: WebSocketService) {}
}
