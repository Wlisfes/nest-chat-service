import { Controller, Get, Post, Body, Query, Headers, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CommunitService } from '@/services/communit.service'
import { ApiDecorator } from '@/decorator/compute.decorator'
import * as env from '@/interface/instance.resolver'

@ApiTags('社群模块')
@Controller('communit')
export class CommunitController {
    constructor(private readonly communitService: CommunitService) {}

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
        return await this.communitService.httpCommunitCreater(headers, request.user.uid, body)
    }

    @Post('/invite/joiner')
    @ApiDecorator({
        operation: { summary: '申请加入社群' },
        authorize: { check: true, next: false },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpCommunitInviteJoiner(
        @Headers() headers: env.Headers,
        @Request() request: env.Omix<{ user: env.RestUserResolver }>,
        @Body() body: env.BodyCommunitInviteJoiner
    ) {
        return await this.communitService.httpCommunitInviteJoiner(headers, request.user.uid, body)
    }

    @Get('/resolver')
    @ApiDecorator({
        operation: { summary: '社群详情' },
        authorize: { check: true, next: false },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpCommunitResolver(
        @Headers() headers: env.Headers,
        @Request() request: env.Omix<{ user: env.RestUserResolver }>,
        @Query() query: env.QueryCommunitResolver
    ) {
        return await this.communitService.httpCommunitResolver(headers, request.user.uid, query)
    }
}
