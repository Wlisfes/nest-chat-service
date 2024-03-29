import { Controller, Get } from '@nestjs/common'
import { DataBaseService } from '@/services/database/database.service'
import { UserService } from '@/services/user/user.service'

@Controller()
export class UserController {
    constructor(private readonly dataBase: DataBaseService, private readonly userService: UserService) {}
}
