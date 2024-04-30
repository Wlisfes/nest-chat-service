import { Controller, Get, Post, Body, Headers, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserService } from '@/services/user.service'
import { ApiDecorator } from '@/decorator/compute.decorator'
import * as env from '@/interface/instance.resolver'

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
        return await this.userService.httpUserRegister(headers, body)
    }

    @Post('/authorizer')
    @ApiDecorator({
        operation: { summary: '登录账号' },
        response: { status: 200, description: 'OK', type: env.RestUserAuthorizer }
    })
    public async httpUserAuthorizer(@Headers() headers: env.Headers, @Request() request: env.Omix, @Body() body: env.BodyUserAuthorizer) {
        return await this.userService.httpUserAuthorizer(headers, request, body)
    }

    @Get('/resolver')
    @ApiDecorator({
        operation: { summary: '账号信息' },
        authorize: { check: true, next: false },
        response: { status: 200, description: 'OK', type: env.RestUserResolver }
    })
    public async httpUserResolver(@Headers() headers: env.Headers, @Request() request: env.Omix<{ user: env.RestUserResolver }>) {
        return await this.userService.httpUserResolver(headers, request.user.uid)
    }

    @Post('/update')
    @ApiDecorator({
        operation: { summary: '用户基础信息更新' },
        authorize: { check: true, next: false },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpUserUpdate(
        @Headers() headers: env.Headers,
        @Request() request: env.Omix<{ user: env.RestUserResolver }>,
        @Body() body: env.BodyUserUpdate
    ) {
        return await this.userService.httpUserUpdate(headers, request.user.uid, body)
    }
}
