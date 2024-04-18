import { IoAdapter } from '@nestjs/platform-socket.io'
import { Logger } from 'winston'
import { CustomService } from '@/services/custom.service'
import { AuthSocket } from '@web-socket/web-socket.resolver'

export class WebSocketAdapter extends IoAdapter {
    constructor(app, private readonly logger: Logger, private readonly customService: CustomService) {
        super(app)
    }

    createIOServer(port: number, options?: Record<string, any>) {
        const server = super.createIOServer(port, options)
        server.use(async (socket: AuthSocket, next) => {
            const { headers } = socket.handshake
            if (!headers.authorization) {
                return next(new Error('未登录'))
            } else {
                try {
                    socket.user = await this.customService.divineJwtTokenParser(headers.authorization, {
                        message: '身份验证失败'
                    })
                } catch (e) {
                    return next(new Error(e.message))
                }
            }
            return next()
        })
        return server
    }
}
