import { CanActivate, ExecutionContext, Injectable, HttpStatus } from '@nestjs/common'
import { WsException } from '@nestjs/websockets'
import { CustomService } from '@/services/custom.service'
import { divineIntNumber } from '@/utils/utils-common'
import * as web from '@/config/instance.config'

@Injectable()
export class WebSocketGuard implements CanActivate {
    constructor(private readonly customService: CustomService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const start = Date.now()
            const requestId = await divineIntNumber({ random: true, bit: 32 })
            const request = context.switchToHttp().getRequest()
            request.handshake.headers[web.WEB_COMMON_HEADER_CONTEXTID] = requestId.toString()
            request.handshake.headers[web.WEB_COMMON_HEADER_STARTTIME] = start.toString()
            if (!request.handshake.headers.authorization) {
                throw new WsException({ message: '未登录', status: HttpStatus.UNAUTHORIZED })
            } else {
                const user = await this.customService.divineJwtTokenParser(request.handshake.headers.authorization, {
                    message: '身份验证失败'
                })
                request.user = user
            }
            return true
        } catch (e) {
            throw new WsException(e.message)
        }
    }
}
