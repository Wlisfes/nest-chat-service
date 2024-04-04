import { Controller, Get, Post, Body, Headers, Request, Response } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CommunitService } from '@/services/communit.service'
import { ApiDecorator } from '@/decorator/compute.decorator'
import * as env from '@/interface/instance.resolver'

@ApiTags('社群模块')
@Controller('communit')
export class CommunitController {
    constructor(private readonly communit: CommunitService) {}

    @Post('/creater')
    @ApiDecorator({
        operation: { summary: '新建社群' },
        authorize: { check: true, next: false },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpCommunitCreater(
        @Headers() headers: env.Headers,
        @Request() request: env.Omix<{ user: env.RestUserResolver }>,
        @Body() body: env.BodyCommunitCreater
    ) {
        return await this.communit.httpCommunitCreater(request.user.uid, body, headers)
    }

    @Get('/column')
    @ApiDecorator({
        operation: { summary: '社群列表' },
        authorize: { check: true, next: false },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpCommunitColumn(@Headers() headers: env.Headers) {}
}
