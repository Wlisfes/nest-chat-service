import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { getClientIp } from 'request-ip'
import { divineIntNumber } from '@/utils/utils-common'
import { APP_HEADER_AUTHORIZE, APP_HEADER_REQUESTID, APP_HEADER_STARTTIME } from '@/config/web-common.config'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}
    async use(request: Request, response: Response, next: NextFunction) {
        const { baseUrl, method, body, query, params, headers } = request
        const ip = getClientIp(request)
        const start = Date.now()
        const requestId = await divineIntNumber({ random: true, bit: 32 })
        request.headers[APP_HEADER_STARTTIME] = start.toString()
        request.headers[APP_HEADER_REQUESTID] = requestId.toString()
        response.on('finish', () => {
            this.logger.info(LoggerMiddleware.name, {
                [APP_HEADER_REQUESTID]: request.headers[APP_HEADER_REQUESTID],
                duration: `${Date.now() - start}ms`,
                log: {
                    url: baseUrl,
                    method,
                    body,
                    query,
                    params,
                    host: headers.host ?? '',
                    origin: headers.origin ?? '',
                    referer: headers.referer ?? '',
                    ip: ['localhost', '::1', '::ffff:127.0.0.1'].includes(ip) ? '127.0.0.1' : ip.replace(/^.*:/, ''),
                    [APP_HEADER_REQUESTID]: requestId.toString(),
                    ['user-agent']: headers['user-agent'] ?? '',
                    authorization: headers[APP_HEADER_AUTHORIZE] ?? ''
                }
            })
        })
        next()
    }
}
