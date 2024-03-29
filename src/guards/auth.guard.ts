import { CanActivate, SetMetadata, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { APP_HEADER_AUTHORIZE, APP_JWT_SECRET } from '@/config/web-common.config'
// import { CustomProvider } from '@/utils/utils-configer'
// import { divineParseJwtToken } from '@/utils/utils-plugin'
// import { divineHandler } from '@/utils/utils-common'

export interface IGuardOption {
    check: boolean
    next: boolean
    baseURL?: boolean
}
export interface IGuardScoper {
    code?: number
    message?: string
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly reflector: Reflector, private readonly jwtService: JwtService) {}

    /**异常拦截处理**/
    public async httpContextAuthorize(next: boolean, { message, code }: IGuardScoper) {
        if (!next) {
            throw new HttpException(message ?? '登录已失效', code ?? HttpStatus.UNAUTHORIZED)
        }
        return false
    }

    /**token解析**/
    public async httpContextJwtTokenParser(token: string, { message, code }: IGuardScoper) {
        try {
            return await this.jwtService.verifyAsync(token, { secret: APP_JWT_SECRET })
        } catch (e) {
            throw new HttpException(message ?? '身份验证失败', code ?? HttpStatus.UNAUTHORIZED)
        }
    }

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const scope = this.reflector.get<IGuardOption>(`APP_AUTH_INJECT`, context.getHandler())
        const baseURL = request.route.path

        /**验证登录**/
        if (scope && scope.check) {
            const token = request.headers[APP_HEADER_AUTHORIZE]
            if (!token) {
                //未携带token
                await this.httpContextAuthorize(scope.next, { message: '未登录' })
            } else {
                /**解析token**/
                const node = await this.httpContextJwtTokenParser(token, { message: '身份验证失败' }).then(async data => {
                    return data
                })
                request.user = node
            }
        }
        return true
    }
}

/**用户登录守卫、使用ApiGuardBearer守卫的接口会验证用户登录**/
export const ApiGuardBearer = (scope: IGuardOption) => SetMetadata(`APP_AUTH_INJECT`, scope)
