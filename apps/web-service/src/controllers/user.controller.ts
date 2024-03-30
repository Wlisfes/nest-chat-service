import { Controller, Post, Body, Headers, Request } from '@nestjs/common'
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
        operation: { summary: '注册账号' },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpUserRegister(@Headers() headers: env.Headers, @Body() body: env.BodyUserRegister) {
        return await this.userService.httpUserRegister(body, headers)
    }

    @Post('/authorizer')
    @ApiDecorator({
        operation: { summary: '登录账号' },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpUserAuthorizer(@Headers() headers: env.Headers, @Request() request: env.Omix, @Body() body: env.BodyUserAuthorizer) {
        return await this.userService.httpUserAuthorizer(body, headers, request)
    }
}
