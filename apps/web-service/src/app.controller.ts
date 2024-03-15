import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    async httpHello() {
        return await this.appService.httpHello()
    }
}
