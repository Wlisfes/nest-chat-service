import { Controller, Post, Body, Headers } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DataBaseService } from '@/services/database/database.service'
import { UserService } from '@/services/user/user.service'
import { ApiDecorator } from '@/decorator/compute.decorator'
import { NoticeResolver } from '@/interface/common.resolver'

@ApiTags('用户模块')
@Controller('user')
export class UserController {
    constructor(private readonly dataBase: DataBaseService, private readonly userService: UserService) {}

    @Post('/register')
    @ApiDecorator({
        operation: { summary: '注册用户' },
        response: { status: 200, description: 'OK', type: NoticeResolver }
    })
    public async httpUserRegister(@Headers() headers, @Body() body) {
        console.log(`1211111`)
        // return await this.customerService.httpRegisterCustomer(body)
    }
}
