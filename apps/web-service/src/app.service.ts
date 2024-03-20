import { Injectable } from '@nestjs/common'
import { divineIntNumber } from '@/utils/utils-common'

@Injectable()
export class AppService {
    async httpHello() {
        console.log(await divineIntNumber(), {
            pid: process.pid,
            script: process.env.npm_lifecycle_script
        })
        return 'Hello World!'
    }
}
