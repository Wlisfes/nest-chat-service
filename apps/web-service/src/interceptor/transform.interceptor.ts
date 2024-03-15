import { CallHandler, ExecutionContext, Injectable, NestInterceptor, HttpStatus } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import * as day from 'dayjs'

@Injectable()
export class TransformInterceptor implements NestInterceptor {
	async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
		return next.handle().pipe(
			map(data => {
				return {
					data: data || null,
					code: HttpStatus.OK,
					message: data.message ?? '请求成功',
					timestamp: day().format('YYYY-MM-DD HH:mm:ss')
				}
			})
		)
	}
}
