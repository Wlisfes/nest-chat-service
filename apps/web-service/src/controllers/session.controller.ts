import { Controller, Get, Post, Body, Headers, Response } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { SessionService } from '@/services/session.service'
import { ApiDecorator } from '@/decorator/compute.decorator'
import * as env from '@/interface/instance.resolver'

@ApiTags('会话模块')
@Controller('session')
export class SessionController {
    constructor(private readonly session: SessionService) {}

    @Get('/column')
    @ApiDecorator({
        operation: { summary: '会话列表' },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpSessionColumn(@Headers() headers: env.Headers) {}
}
