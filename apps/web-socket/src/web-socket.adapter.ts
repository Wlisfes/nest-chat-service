import { Inject, HttpStatus } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { Redis } from 'ioredis'
import { ConfigService } from '@nestjs/config'
import { WinstonLogger, WINSTON_MODULE_PROVIDER } from '@/services/logger.service'
import { CustomService } from '@/services/custom.service'
import { divineCustomizeError, divineIntNumber } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'
import * as web from '@/config/web-instance'

export class WebSocketAdapter extends IoAdapter {
    private readonly customService: CustomService
    private readonly configService: ConfigService
    private adapterConstructor: ReturnType<typeof createAdapter>
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: WinstonLogger

    constructor(app) {
        super(app)
        this.customService = app.get(CustomService)
        this.configService = app.get(ConfigService)
    }

    async createRedisConnect() {
        const host = this.configService.get('REDIS_HOST')
        const port = this.configService.get('REDIS_PORT')
        const password = this.configService.get('REDIS_PASSWORD')
        const pubClient = new Redis({ host, port, password })
        const subClient = pubClient.duplicate()
        this.adapterConstructor = createAdapter(pubClient, subClient)
    }

    createIOServer(port: number, options?: Record<string, any>) {
        const server = super.createIOServer(port, options)
        server.adapter(this.adapterConstructor)
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
