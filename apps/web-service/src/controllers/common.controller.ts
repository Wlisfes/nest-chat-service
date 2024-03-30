import { Controller, Post, Body, Headers } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CommonService } from '@/services/common/common.service'
import { ApiDecorator } from '@/decorator/compute.decorator'
import * as env from '@/interface/instance'

@ApiTags('通用模块')
@Controller('common')
export class CommonController {
    constructor(private readonly commonService: CommonService) {}

    @Post('/mail/sender')
    @ApiDecorator({
        operation: { summary: '发送邮件验证码' },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpCommonNodemailerSender(@Headers() headers: env.Headers, @Body() body: env.BodyCommonNodemailerSender) {
        return await this.commonService.httpCommonNodemailerSender(body, headers)
    }
}
