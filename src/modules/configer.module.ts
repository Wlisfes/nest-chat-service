import { Module, Global } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import * as path from 'path'

/**自定义加载环境变量**/
export function divineCustomProvider() {
    console.log(process.env.npm_lifecycle_script)
    return {}
}

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
            load: [divineCustomProvider]
        })
    ],
    controllers: [],
    providers: [],
    exports: []
})
export class ConfigerModule {}
