import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { getClientIp } from 'request-ip'
import { divineIntNumber } from '@/utils/utils-common'
import * as web from '@/config/instance.config'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}
    async use(request: Request, response: Response, next: NextFunction) {
        const { baseUrl, method, body, query, params, headers } = request
        const ip = getClientIp(request)
        const start = Date.now()
        const requestId = await divineIntNumber({ random: true, bit: 32 })
        /**起始日志 startTime**/
        this.logger.info(LoggerMiddleware.name, {
            [web.WEB_COMMON_HEADER_CONTEXTID]: requestId.toString(),
            duration: '0ms',
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
                ['user-agent']: headers['user-agent'] ?? '',
                authorization: headers[web.WEB_COMMON_HEADER_AUTHORIZE] ?? ''
            }
        })

        request.headers[web.WEB_COMMON_HEADER_STARTTIME] = start.toString()
        request.headers[web.WEB_COMMON_HEADER_CONTEXTID] = requestId.toString()
        response.on('finish', () => {
            /**结束日志 endTime**/
            this.logger.info(LoggerMiddleware.name, {
                [web.WEB_COMMON_HEADER_CONTEXTID]: requestId.toString(),
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
                    ['user-agent']: headers['user-agent'] ?? '',
                    authorization: headers[web.WEB_COMMON_HEADER_AUTHORIZE] ?? ''
                }
            })
        })
        next()
    }
}
