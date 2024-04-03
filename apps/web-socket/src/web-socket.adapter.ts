import { IoAdapter } from '@nestjs/platform-socket.io'
import { WsException } from '@nestjs/websockets'
import { ConfigService } from '@nestjs/config'
import { Socket } from 'socket.io'
import { createClient } from 'redis'
import { createAdapter } from '@socket.io/redis-adapter'

export interface AuthSocket extends Socket {
    user?: any
}

export class WebSocketAdapter extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter>
    constructor(app, private readonly config: ConfigService) {
        super(app)
    }

    async createRedisConnect() {
        const host = this.config.get('REDIS_HOST')
        const port = this.config.get('REDIS_PORT')
        const pubClient = await createClient({
            url: `redis://${host}:${port}`,
            password: this.config.get('REDIS_PASSWORD')
        })
        const subClient = pubClient.duplicate()
        await Promise.all([pubClient.connect(), subClient.connect()])
        this.adapterConstructor = createAdapter(pubClient, subClient)
    }

    createIOServer(port: number, options?: Record<string, any>) {
        const server = super.createIOServer(port, options)
        server.use(async (socket: AuthSocket, next) => {
            const { headers, auth } = socket.handshake
            console.log('Inside Websocket Adapter:')
            if (!auth.token) {
                return next(new Error('Not Authenticated. No cookies were sent'))
            }
            return next()
        })
        server.adapter(this.adapterConstructor)
        return server
    }
}
