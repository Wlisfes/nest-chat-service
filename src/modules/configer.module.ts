import { Module, Global } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { APP_JWT_SECRET } from '@/config/web-common.config'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import * as path from 'path'

/**自定义加载环境变量**/
export function divineCustomProvider() {
    return {}
}

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true
            //load: [divineCustomProvider]
        }),
        JwtModule.register({
            global: true,
            secret: APP_JWT_SECRET
        })
    ],
    controllers: [],
    providers: [ConfigService, JwtService],
    exports: [ConfigService, JwtService]
})
export class ConfigerModule {}
