import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { getClientIp } from 'request-ip'
import { divineIntNumber } from '@/utils/utils-common'
import * as web from '@/config/web-instance'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}
    async use(request: env.Omix<Request>, response: Response, next: NextFunction) {
        const { baseUrl, method, body, query, params, headers } = request
        const clientIp = getClientIp(request)
        const start = Date.now()
        const requestId = await divineIntNumber({ random: true, bit: 32 })
        const ip = ['localhost', '::1', '::ffff:127.0.0.1'].includes(clientIp) ? '127.0.0.1' : clientIp.replace(/^.*:/, '')

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
                ip: ip,
                origin: headers.origin ?? '',
                referer: headers.referer ?? '',
                ['user-agent']: headers['user-agent'] ?? '',
                authorization: headers[web.WEB_COMMON_HEADER_AUTHORIZE] ?? ''
            }
        })

        request.headers.ip = ip
        request.headers.browser = request.useragent.browser
        request.headers.platform = request.useragent.platform
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
                    ip: ip,
                    origin: headers.origin ?? '',
                    referer: headers.referer ?? '',
                    ['user-agent']: headers['user-agent'] ?? '',
                    authorization: headers[web.WEB_COMMON_HEADER_AUTHORIZE] ?? ''
                }
            })
        })
        next()
    }
}
