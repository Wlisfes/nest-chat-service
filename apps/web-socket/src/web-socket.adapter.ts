import { IoAdapter } from '@nestjs/platform-socket.io'
import { WsException } from '@nestjs/websockets'
import { Logger } from 'winston'
import { CustomService } from '@/services/custom.service'
import * as env from '@/interface/instance.resolver'

export class WebSocketAdapter extends IoAdapter {
    constructor(app, private readonly logger: Logger, private readonly customService: CustomService) {
        super(app)
    }

    createIOServer(port: number, options?: Record<string, any>) {
        const server = super.createIOServer(port, options)
        server.use(async (socket: env.AuthSocket, next) => {
            const { headers } = socket.handshake
            if (!headers.authorization) {
                return next(new WsException('未登录'))
            } else {
                try {
                    socket.user = await this.customService.divineJwtTokenParser(headers.authorization, {
                        message: '身份验证失败'
                    })
                } catch (e) {
                    return next(new WsException(e.message))
                }
            }
            return next()
        })
        return server
    }
}
