import { Controller, Get, Post, Body, Query, Headers, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ContactService } from '@/services/contact.service'
import { ApiDecorator } from '@/decorator/compute.decorator'
import * as env from '@/interface/instance.resolver'

@ApiTags('好友模块')
@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    @Post('/invite')
    @ApiDecorator({
        operation: { summary: '申请添加好友' },
        authorize: { check: true, next: false },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpContactInvite(
        @Headers() headers: env.Headers,
        @Request() request: env.Omix<{ user: env.RestUserResolver }>,
        @Body() body: env.BodyContactInvite
    ) {
        return await this.contactService.httpContactInvite(headers, request.user.uid, body)
    }

    @Get('/column')
    @ApiDecorator({
        operation: { summary: '好友列表' },
        authorize: { check: true, next: false },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpContactColumn(@Headers() headers: env.Headers, @Request() request: env.Omix<{ user: env.RestUserResolver }>) {
        return await this.contactService.httpContactColumn(headers, request.user.uid)
    }

    @Get('/resolver')
    @ApiDecorator({
        operation: { summary: '好友关系详情' },
        authorize: { check: true, next: false },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpContactResolver(
        @Headers() headers: env.Headers,
        @Request() request: env.Omix<{ user: env.RestUserResolver }>,
        @Query() query: env.QueryContactResolver
    ) {
        return await this.contactService.httpContactResolver(headers, request.user.uid, query)
    }
}
