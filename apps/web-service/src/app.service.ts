import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
    async httpHello() {
        return 'Hello World!'
    }
}
