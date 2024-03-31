import { Injectable, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'

@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
    protected async throwThrottlingException(
        context: ExecutionContext,
        detail: Parameters<ThrottlerGuard['throwThrottlingException']>['1']
    ) {
        throw new HttpException('操作频繁，请稍后再试！', HttpStatus.TOO_MANY_REQUESTS)
    }
}
