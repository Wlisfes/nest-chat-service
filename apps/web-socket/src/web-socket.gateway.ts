import { Inject, UseGuards, HttpStatus } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets'
import { SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { Server, Socket } from 'socket.io'
import { WebSocketGuard } from '@/guards/web-socket.guard'
import { WebSocketClientService } from '@web-socket/services/web-socket.client.service'
import { WebSocketService } from '@web-socket/services/web-socket.service'
import { divineLogger, divineResolver } from '@/utils/utils-common'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'

@WebSocketGateway(web.WEB_SOCKET_PORT, {
    cors: { origin: '*' },
    transport: ['websocket'],
    pingInterval: 10000,
    pingTimeout: 15000
})
export class WebSocketEventGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly webSocketClientService: WebSocketClientService,
        private readonly webSocketService: WebSocketService
    ) {}

    /**服务启动**/
    public async afterInit(server: Server) {
        console.log('[web-socket]服务启动:', `ws://localhost:${web.WEB_SOCKET_PORT}`)
    }

    /**开启长连接**/
    public async handleConnection(@ConnectedSocket() socket: env.AuthSocket) {
        this.logger.info(
            [WebSocketEventGateway.name, this.handleConnection.name].join(':'),
            divineLogger(
                { [web.WEB_COMMON_HEADER_CONTEXTID]: socket.id },
                { message: '开启长连接', socketId: socket.id, user: socket.user }
            )
        )
        await this.webSocketClientService.setClient(socket.user.uid, socket)
    }

    /**中断长连接**/
    public async handleDisconnect(@ConnectedSocket() socket: env.AuthSocket) {
        this.logger.info(
            [WebSocketEventGateway.name, this.handleDisconnect.name].join(':'),
            divineLogger(
                { [web.WEB_COMMON_HEADER_CONTEXTID]: socket.id },
                { message: '中断长连接', socketId: socket.id, user: socket.user }
            )
        )
        await this.webSocketClientService.disconnect(socket.user.uid)
    }

    /**发送自定义消息**/
    @UseGuards(WebSocketGuard)
    @SubscribeMessage('socket-customize-messager')
    public async SubscribeSocketCustomizeMessager(
        @ConnectedSocket() socket: env.AuthSocket,
        @MessageBody() scope: env.BodySocketCustomizeMessager
    ) {
        try {
            this.logger.info(
                [WebSocketEventGateway.name, this.SubscribeSocketCustomizeMessager.name].join(':'),
                divineLogger(socket.handshake.headers, { message: '发送自定义消息-开始', socketId: socket.id, data: scope })
            )
            const node = await this.webSocketService.httpSocketCustomizeMessager(socket.handshake.headers, socket.user.uid, scope)
            this.logger.info(
                [WebSocketEventGateway.name, this.SubscribeSocketCustomizeMessager.name].join(':'),
                divineLogger(socket.handshake.headers, { message: '发送自定义消息-结束', socketId: socket.id, node })
            )
            return await divineResolver(node)
        } catch (e) {
            this.logger.error(
                [WebSocketEventGateway.name, this.SubscribeSocketCustomizeMessager.name].join(':'),
                divineLogger(socket.handshake.headers, {
                    message: e.message,
                    status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
                    socketId: socket.id
                })
            )
            return await divineResolver({
                message: e.message,
                status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR
            })
        }
    }
}
