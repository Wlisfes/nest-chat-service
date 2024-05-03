import { Inject, ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { moment, divineLogger, divineResolver } from '@/utils/utils-common'
import * as web from '@/config/web-instance'
import * as env from '@/interface/instance.resolver'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

    async catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse()
        const request = ctx.getRequest()
        const Result: env.Omix = {
            requestId: request.headers[web.WEB_COMMON_HEADER_CONTEXTID],
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
            url: request.url,
            method: request.method,
            code: exception.status
        }
        if (exception.response && Array.isArray(exception.response.message)) {
            Result.message = exception.response.message[0]
            Result.data = exception.response
        } else {
            Result.message = exception.message
            Result.data = await divineResolver({
                message: exception.message,
                status: exception.status ?? HttpStatus.INTERNAL_SERVER_ERROR
            }).then(data => {
                if (exception.response && exception.response.cause) {
                    return { ...data, cause: exception.response.cause }
                }
                return data
            })
        }
        this.logger.error(HttpExceptionFilter.name, divineLogger(request.headers, Result))
        response.status(HttpStatus.OK)
        response.header('Content-Type', 'application/json; charset=utf-8')
        response.send(Result)
    }
}
