import { IoAdapter } from '@nestjs/platform-socket.io'
import { WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'

export interface AuthSocket extends Socket {
    user?: any
}

export class WebSocketAdapter extends IoAdapter {
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
        return server
    }
}
