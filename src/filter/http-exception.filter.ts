import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { moment } from '@/utils/utils-common'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse()
        const request = ctx.getRequest()
        const error = exception?.response?.hasOwnProperty('statusCode') ? exception.response ?? null : exception ?? null
        const message = Array.isArray(exception.response?.message) ? exception.response.message[0] : exception.message

        const Result = {
            data: error,
            message,
            code: exception.status,
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
            url: request.url,
            method: request.method
        }

        // 设置返回的状态码、请求头、发送错误信息
        response.status(HttpStatus.OK)
        response.header('Content-Type', 'application/json; charset=utf-8')
        response.send(Result)
    }
}
