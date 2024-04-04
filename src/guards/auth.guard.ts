import { CanActivate, SetMetadata, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { CustomService } from '@/services/custom.service'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'
// import { CustomProvider } from '@/utils/utils-configer'
// import { divineParseJwtToken } from '@/utils/utils-plugin'
// import { divineHandler } from '@/utils/utils-common'

export interface IGuardOption {
    check: boolean
    next: boolean
    baseURL?: boolean
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly reflector: Reflector, private readonly custom: CustomService) {}

    /**异常拦截处理**/
    public async httpContextAuthorize(next: boolean, scope: Partial<env.Omix<{ message: string; status: number }>>) {
        if (!next) {
            throw new HttpException(scope.message ?? '登录已失效', scope.status ?? HttpStatus.UNAUTHORIZED)
        }
        return false
    }

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const scope = this.reflector.get<IGuardOption>(`APP_AUTH_INJECT`, context.getHandler())
        const baseURL = request.route.path

        /**验证登录**/
        if (scope && scope.check && scope.next) {
            const token = request.headers[web.WEB_COMMON_HEADER_AUTHORIZE]
            if (!token) {
                //未携带token
                await this.httpContextAuthorize(scope.next, { message: '未登录' })
            } else {
                /**解析token**/
                const node = await this.custom.divineJwtTokenParser(token, { message: '身份验证失败' })
                request.user = node
            }
        }
        return true
    }
}

/**用户登录守卫、使用ApiGuardBearer守卫的接口会验证用户登录**/
export const ApiGuardBearer = (scope: IGuardOption) => SetMetadata(`APP_AUTH_INJECT`, scope)
