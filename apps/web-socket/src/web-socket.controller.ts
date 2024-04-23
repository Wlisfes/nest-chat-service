import { Controller } from '@nestjs/common'
import { WebSocketService } from '@web-socket/services/web-socket.service'
import { MessagePattern } from '@nestjs/microservices'

@Controller()
export class WebSocketController {
    constructor(private readonly webSocketService: WebSocketService) {}

    @MessagePattern('notifications')
    public async httpSocketPushCustomizeMessager(data) {
        console.log('httpSocketPushCustomizeMessager', data)
        return data
    }
}
