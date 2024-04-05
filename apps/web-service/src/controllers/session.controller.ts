import { Controller, Get, Post, Body, Headers, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { SessionService } from '@/services/session.service'
import { ApiDecorator } from '@/decorator/compute.decorator'
import * as env from '@/interface/instance.resolver'

@ApiTags('会话模块')
@Controller('session')
export class SessionController {
    constructor(private readonly session: SessionService) {}

    @Get('/columner')
    @ApiDecorator({
        operation: { summary: '会话列表' },
        authorize: { check: true, next: false },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpSessionColumner(@Headers() headers: env.Headers, @Request() request: env.Omix<{ user: env.RestUserResolver }>) {
        return await this.session.httpSessionColumner(headers, request.user.uid)
    }
}
