import { Inject, UseGuards, HttpStatus } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets'
import { SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { Server } from 'socket.io'
import { WebSocketGuard } from '@/guards/web-socket.guard'
import { WebSocketClientService } from '@web-socket/services/web-socket.client.service'
import { WebSocketService } from '@web-socket/services/web-socket.service'
import { divineLogger, divineResolver } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'

@WebSocketGateway(34571, {
    path: '/web-socket',
    cors: true,
    transport: ['websocket'],
    pingInterval: 10000,
    pingTimeout: 15000
})
export class WebSocketEventGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private readonly server: Server

    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly webSocketClientService: WebSocketClientService,
        private readonly webSocketService: WebSocketService
    ) {}

    /**服务启动**/
    public async afterInit(server: Server) {
        console.log('[web-socket]服务启动:', `ws://localhost:34571`)
        await this.webSocketClientService.setServer(server)
    }

    /**开启长连接**/
    public async handleConnection(@ConnectedSocket() socket: env.AuthSocket) {
        await this.webSocketService.httpSocketConnection(socket.handshake.headers, socket, socket.user.uid)
        console.log(this.server.sockets.adapter.rooms)
        this.logger.info(
            [WebSocketEventGateway.name, this.handleDisconnect.name].join(':'),
            divineLogger(socket.handshake.headers, { message: '开启长连接-初始化完毕', socketId: socket.id, user: socket.user })
        )
    }

    /**中断长连接**/
    public async handleDisconnect(@ConnectedSocket() socket: env.AuthSocket) {
        this.logger.info(
            [WebSocketEventGateway.name, this.handleDisconnect.name].join(':'),
            divineLogger(socket.handshake.headers, { message: '中断长连接', socketId: socket.id, user: socket.user })
        )
        await this.webSocketClientService.disconnect(socket.user.uid)
    }

    /**发送消息已读操作**/
    @UseGuards(WebSocketGuard)
    @SubscribeMessage('socket-change-messager')
    public async SubscribeSocketChangeMessager(
        @ConnectedSocket() socket: env.AuthSocket,
        @MessageBody() scope: env.BodySocketChangeMessager
    ) {
        try {
            this.logger.info(
                [WebSocketEventGateway.name, this.SubscribeSocketChangeMessager.name].join(':'),
                divineLogger(socket.handshake.headers, { message: '发送消息已读操作-开始', socketId: socket.id, data: scope })
            )
            /**Socket已读消息操作、消息推入MQ队列**/ //prettier-ignore
            return await this.webSocketService.httpSocketChangeMessager(socket.handshake.headers, scope).then(async node => {
                this.logger.info(
                    [WebSocketEventGateway.name, this.SubscribeSocketChangeMessager.name].join(':'),
                    divineLogger(socket.handshake.headers, { message: '发送消息已读操作-结束', socketId: socket.id, data: scope })
                )
                return await divineResolver(node)
            })
        } catch (e) {
            this.logger.error(
                [WebSocketEventGateway.name, this.SubscribeSocketChangeMessager.name].join(':'),
                divineLogger(socket.handshake.headers, {
                    message: `发送消息已读操作失败：${e.message}`,
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

    /**发送自定义消息**/
    @UseGuards(WebSocketGuard)
    @SubscribeMessage('socket-customize-messager')
    public async SubscribeSocketCustomizeMessager(
        @ConnectedSocket() socket: env.AuthSocket,
        @MessageBody() scope: env.BodyCheckCustomizeMessager
    ) {
        try {
            this.logger.info(
                [WebSocketEventGateway.name, this.SubscribeSocketCustomizeMessager.name].join(':'),
                divineLogger(socket.handshake.headers, { message: '发送自定义消息-开始', socketId: socket.id, data: scope })
            )
            /**Socket发送自定义消息、消息推入MQ队列**/
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
                    message: `发送自定义消息失败：${e.message}`,
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
