import { Controller, Post, Body, Headers } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DataBaseService } from '@/services/database/database.service'
import { UserService } from '@/services/user/user.service'
import { NodemailerService } from '@/services/nodemailer/nodemailer.service'
import { ApiDecorator } from '@/decorator/compute.decorator'
import * as env from '@/interface/instance'

@ApiTags('通用模块')
@Controller('common')
export class CommonController {
    constructor(
        private readonly dataBase: DataBaseService,
        private readonly userService: UserService,
        private readonly nodemailerService: NodemailerService
    ) {}

    @Post('/mail/sender')
    @ApiDecorator({
        operation: { summary: '发送邮件验证码' },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpCommonNodemailer(@Body() body: env.BodyCommonNodemailer) {
        console.log(body)
        return { message: '发送成功' }
    }
}
