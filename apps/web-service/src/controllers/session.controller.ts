import { Controller, Get, Post, Body, Query, Headers, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { SessionService } from '@/services/session.service'
import { ApiDecorator } from '@/decorator/compute.decorator'
import * as env from '@/interface/instance.resolver'

@ApiTags('会话模块')
@Controller('session')
export class SessionController {
    constructor(private readonly sessionService: SessionService) {}

    @Get('/column')
    @ApiDecorator({
        operation: { summary: '会话列表' },
        authorize: { check: true, next: false },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpSessionColumn(@Headers() headers: env.Headers, @Request() request: env.Omix<{ user: env.RestUserResolver }>) {
        return await this.sessionService.httpSessionColumn(headers, request.user.uid)
    }

    @Get('/resolver')
    @ApiDecorator({
        operation: { summary: '会话详情' },
        authorize: { check: true, next: false },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpSessionOneResolver(
        @Headers() headers: env.Headers,
        @Request() request: env.Omix<{ user: env.RestUserResolver }>,
        @Query() query: env.BodySessionOneResolver
    ) {
        return await this.sessionService.httpSessionOneResolver(headers, request.user.uid, query)
    }
}
