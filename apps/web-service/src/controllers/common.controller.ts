import { Controller, Get, Post, Body, Headers, Response } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CommonService } from '@/services/common/common.service'
import { ApiDecorator } from '@/decorator/compute.decorator'
import * as env from '@/interface/instance.resolver'

@ApiTags('通用模块')
@Controller('common')
export class CommonController {
    constructor(private readonly common: CommonService) {}

    @Get('/grapher')
    @ApiDecorator({
        operation: { summary: '图形验证码验证码' },
        response: { status: 200, description: 'OK' }
    })
    public async httpCommonGrapher(@Response() response, @Headers() headers: env.Headers) {
        return await this.common.httpCommonGrapher(response, headers)
    }

    @Post('/mail/sender')
    @ApiDecorator({
        operation: { summary: '发送邮件验证码' },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpCommonNodemailerSender(@Headers() headers: env.Headers, @Body() body: env.BodyCommonNodemailerSender) {
        return await this.common.httpCommonNodemailerSender(body, headers)
    }
}
