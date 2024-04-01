import { CallHandler, ExecutionContext, Injectable, NestInterceptor, HttpStatus } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { moment } from '@/utils/utils-common'
import * as web from '@/config/instance.config'

@Injectable()
export class TransformInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
        const request = context.switchToHttp().getRequest()
        return next.handle().pipe(
            map(data => {
                return {
                    data: data || null,
                    code: HttpStatus.OK,
                    message: data?.message ?? '请求成功',
                    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
                    requestId: request.headers[web.WEB_COMMON_HEADER_CONTEXTID]
                }
            })
        )
    }
}
