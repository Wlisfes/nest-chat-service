import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { WebSocketService } from '@web-socket/services/web-socket.service'
import * as env from '@/interface/instance.resolver'

@Controller()
export class WebSocketController {
    constructor(private readonly webSocketService: WebSocketService) {}

    /**刷新用户Socket会话房间**/
    @MessagePattern('web-socket-refresh-session')
    public async httpSocketJoinSession(@Payload() scope: env.ClientPayload<{ userId: string; sid: string }>) {
        return await this.webSocketService.httpSocketJoinSession(scope.headers, scope.state)
    }

    /**Socket推送消息至客户端**/
    @MessagePattern('web-socket-push-messager')
    public async httpSocketPushCustomizeMessager(@Payload() scope: env.ClientPayload<env.BodySocketPushCustomizeMessager>) {
        return await this.webSocketService.httpSocketPushCustomizeMessager(scope.headers, scope.state)
    }

    /**Socket推送消息状态变更至客户端**/
    @MessagePattern('web-socket-push-change-messager')
    public async httpSocketPushChangeMessager(@Payload() scope: env.ClientPayload<env.BodySocketPushCustomizeMessager>) {
        return await this.webSocketService.httpSocketPushChangeMessager(scope.headers, scope.state)
    }
}
