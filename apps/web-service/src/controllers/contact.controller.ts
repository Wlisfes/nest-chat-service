import { Controller, Get, Post, Body, Headers, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ContactService } from '@/services/contact.service'
import { ApiDecorator } from '@/decorator/compute.decorator'
import * as env from '@/interface/instance.resolver'

@ApiTags('联系人模块')
@Controller('contact')
export class ContactController {
    constructor(private readonly contact: ContactService) {}

    @Post('/invite')
    @ApiDecorator({
        operation: { summary: '申请添加联系人' },
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

    @Post('/creater')
    @ApiDecorator({
        operation: { summary: '新增联系人' },
        authorize: { check: true, next: false },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpContactCreater(
        @Headers() headers: env.Headers,
        @Request() request: env.Omix<{ user: env.RestUserResolver }>,
        @Body() body: env.BodyContactCreater
    ) {
        return await this.contact.httpContactCreater(headers, request.user.uid, body)
    }

    @Get('/columner')
    @ApiDecorator({
        operation: { summary: '联系人列表' },
        authorize: { check: true, next: false },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpContactColumner(@Headers() headers: env.Headers, @Request() request: env.Omix<{ user: env.RestUserResolver }>) {
        return await this.contact.httpContactColumner(headers, request.user.uid)
    }
}
