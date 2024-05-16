import { Inject, UseGuards } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets'
import { SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets'
import { WINSTON_MODULE_PROVIDER, WinstonLogger, NestLogger, CustomHeaderLogger } from '@/services/logger.service'
import { Server } from 'socket.io'
import { WebSocketGuard } from '@/guards/web-socket.guard'
import { WebSocketClientService } from '@web-socket/services/web-socket.client.service'
import { WebSocketService } from '@web-socket/services/web-socket.service'
import { divineResolver } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'

@WebSocketGateway(Number(process.env.SOCKET_PORT), {
    path: '/web-socket',
    cors: true,
    transport: ['websocket'],
    pingInterval: 10000,
    pingTimeout: 15000
})
export class WebSocketEventGateway implements OnGatewayConnection, OnGatewayDisconnect {
    protected readonly logger: NestLogger
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly loggerService: WinstonLogger
    @WebSocketServer() private readonly server: Server

    constructor(private readonly webSocketClientService: WebSocketClientService, private readonly webSocketService: WebSocketService) {}

    /**服务启动**/
    public async afterInit(server: Server) {
        console.log('[web-socket]服务启动:', `ws://localhost:34571`, process.env.SOCKET_PORT)
        await this.webSocketClientService.setServer(server)
    }

    /**开启长连接**/
    @CustomHeaderLogger(socket => socket.handshake.headers)
    public async handleConnection(@ConnectedSocket() socket: env.AuthSocket) {
        await this.webSocketService.httpSocketConnection(socket.handshake.headers, socket, socket.user.uid)
        // this.server.serverSideEmit('socket-connection', socket.user.uid)
        this.logger.info({ message: '开启长连接-初始化完毕', socketId: socket.id, user: socket.user })
    }

    /**中断长连接**/
    @CustomHeaderLogger(socket => socket.handshake.headers)
    public async handleDisconnect(@ConnectedSocket() socket: env.AuthSocket) {
        await this.webSocketClientService.disconnect(socket.user.uid)
        this.logger.info({ message: '中断长连接', socketId: socket.id, user: socket.user })
    }

    // @SubscribeMessage('socket-connection')
    // public async SubscribeSocketConnection(@ConnectedSocket() socket: env.AuthSocket, @MessageBody() scope) {
    //     console.log(scope, socket)
    // }

    /**发送消息已读操作**/
    @UseGuards(WebSocketGuard)
    @SubscribeMessage('socket-change-messager')
    @CustomHeaderLogger(socket => socket.handshake.headers)
    public async SubscribeSocketChangeMessager(
        @ConnectedSocket() socket: env.AuthSocket,
        @MessageBody() scope: env.BodySocketChangeMessager
    ) {
        this.logger.info({ message: '发送消息已读操作-开始', socketId: socket.id, data: scope })
        /**Socket已读消息操作、消息推入MQ队列**/
        const node = await this.webSocketService.httpSocketChangeMessager(socket.handshake.headers, scope)
        return await divineResolver(node, () => {
            this.logger.info({ message: '发送消息已读操作-结束', socketId: socket.id, data: scope })
        })
    }

    /**发送自定义消息**/
    @UseGuards(WebSocketGuard)
    @SubscribeMessage('socket-customize-messager')
    @CustomHeaderLogger(socket => socket.handshake.headers)
    public async SubscribeSocketCustomizeMessager(
        @ConnectedSocket() socket: env.AuthSocket,
        @MessageBody() scope: env.BodyCheckCustomizeMessager
    ) {
        this.logger.info({ message: '发送自定义消息-开始', socketId: socket.id, data: scope })
        /**Socket发送自定义消息、消息推入MQ队列**/
        const node = await this.webSocketService.httpSocketCustomizeMessager(socket.handshake.headers, socket.user.uid, scope)
        return await divineResolver(node, () => {
            this.logger.info({ message: '发送自定义消息-结束', socketId: socket.id, node })
        })
    }
}
