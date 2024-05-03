import { Module, Global } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule as NestThrottlerModule } from '@nestjs/throttler'
import { AuthThrottlerGuard } from '@/guards/auth.throttler.guard'
import * as web from '@/config/web-instance'

@Global()
@Module({
    imports: [NestThrottlerModule.forRoot([web.WEB_THROTTLE.default, web.WEB_THROTTLE.small, web.WEB_THROTTLE.large])],
    providers: [{ provide: APP_GUARD, useClass: AuthThrottlerGuard }],
    controllers: [],
    exports: []
})
export class ThrottlerModule {}
