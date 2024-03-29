import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { getClientIp } from 'request-ip'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}
    use(request: Request, response: Response, next: NextFunction) {
        const { baseUrl, method, body, query, params, headers } = request
        const ip = getClientIp(request)
        const start = Date.now()
        response.on('finish', () => {
            const duration = Date.now() - start
            this.logger.info(LoggerMiddleware.name, {
                log: {
                    url: baseUrl,
                    method,
                    body,
                    query,
                    params,
                    host: headers.host ?? '',
                    origin: headers.origin ?? '',
                    referer: headers.referer ?? '',
                    duration: `耗时: ${duration}ms`,
                    ip: ['localhost', '::1', '::ffff:127.0.0.1'].includes(ip) ? '127.0.0.1' : ip.replace(/^.*:/, ''),
                    ['user-agent']: headers['user-agent'],
                    ['authorization']: headers['authorization']
                }
            })
        })
        next()
    }
}
