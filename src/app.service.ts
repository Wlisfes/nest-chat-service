import { Injectable } from '@nestjs/common'
import { snowflakeId } from 'snowflake-id-maker'
import { divineIntNumber } from '@/utils/utils-common'

@Injectable()
export class AppService {
    async httpHello() {
        console.log(process.pid, await divineIntNumber())
        return 'Hello World!'
    }
}
