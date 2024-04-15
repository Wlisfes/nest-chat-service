import { IoAdapter } from '@nestjs/platform-socket.io'
import { WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { Logger } from 'winston'
import { RedisService } from '@/services/redis/redis.service'

export interface AuthSocket extends Socket {
    user?: any
}

export class WebSocketAdapter extends IoAdapter {
    constructor(app, private readonly logger: Logger, private readonly RedisService: RedisService) {
        super(app)
    }

    createIOServer(port: number, options?: Record<string, any>) {
        const server = super.createIOServer(port, options)
        server.use(async (socket: AuthSocket, next) => {
            const { headers, auth } = socket.handshake
            console.log({ headers, auth })
            if (!auth.token) {
                return next(new Error('Not Authenticated'))
            }
            return next()
        })
        return server
    }
}
