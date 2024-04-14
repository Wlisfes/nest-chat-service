import { Controller, Get, Post, Body, Headers, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ContactService } from '@/services/contact.service'
import { ApiDecorator } from '@/decorator/compute.decorator'
import * as env from '@/interface/instance.resolver'

@ApiTags('好友模块')
@Controller('contact')
export class ContactController {
    constructor(private readonly contact: ContactService) {}

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
        return await this.contact.httpContactInvite(headers, request.user.uid, body)
    }

    @Get('/column')
    @ApiDecorator({
        operation: { summary: '好友列表' },
        authorize: { check: true, next: false },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpContactColumn(@Headers() headers: env.Headers, @Request() request: env.Omix<{ user: env.RestUserResolver }>) {
        return await this.contact.httpContactColumn(headers, request.user.uid)
    }
}
