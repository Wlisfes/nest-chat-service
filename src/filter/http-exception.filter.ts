import { Inject, ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { moment, divineLogger } from '@/utils/utils-common'
import * as env from '@/interface/instance'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse()
        const request = ctx.getRequest()
        const Result: env.Omix = {
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
            url: request.url,
            method: request.method,
            code: exception.status
        }
        if (exception.response && Array.isArray(exception.response.message)) {
            Result.data = exception.response
            Result.message = exception.response.message[0]
        } else {
            const data = { message: exception.message, status: exception.status ?? HttpStatus.INTERNAL_SERVER_ERROR }
            Result.data = data
            Result.message = data.message
        }
        this.logger.error(HttpExceptionFilter.name, divineLogger(request.headers, Result))
        response.status(HttpStatus.OK)
        response.header('Content-Type', 'application/json; charset=utf-8')
        response.send(Result)
    }
}
