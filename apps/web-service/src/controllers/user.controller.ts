import { Controller, Post, Body, Headers } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserService } from '@/services/user/user.service'
import { ApiDecorator } from '@/decorator/compute.decorator'
import * as env from '@/interface/instance'

@ApiTags('用户模块')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('/register')
    @ApiDecorator({
        operation: { summary: '注册用户' },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpUserRegister(@Headers() headers: env.Headers, @Body() body: env.BodyUserRegister) {
        return await this.userService.httpUserRegister(body, headers)
    }
}
