import { HttpStatus } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { Logger } from 'winston'
import { CustomService } from '@/services/custom.service'
import { divineCustomizeError, divineIntNumber } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'
import * as web from '@/config/instance.config'

export class WebSocketAdapter extends IoAdapter {
    constructor(app, private readonly logger: Logger, private readonly customService: CustomService) {
        super(app)
    }

    createIOServer(port: number, options?: Record<string, any>) {
        const server = super.createIOServer(port, options)
        server.use(async (socket: env.AuthSocket, next) => {
            const { headers } = socket.handshake
            const start = Date.now()
            const requestId = await divineIntNumber({ random: true, bit: 32 })
            socket.handshake.headers[web.WEB_COMMON_HEADER_CONTEXTID] = requestId.toString()
            socket.handshake.headers[web.WEB_COMMON_HEADER_STARTTIME] = start.toString()
            if (!headers.authorization) {
                return next(divineCustomizeError({ message: '未登录', status: HttpStatus.UNAUTHORIZED }))
            } else {
                try {
                    socket.user = await this.customService.divineJwtTokenParser(headers.authorization, {
                        message: '身份验证失败'
                    })
                } catch (e) {
                    return next(divineCustomizeError({ message: e.message, status: e.status ?? HttpStatus.UNAUTHORIZED }))
                }
            }
            return next()
        })
        return server
    }
}
