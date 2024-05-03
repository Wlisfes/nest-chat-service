import { Module, Global } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule, JwtService } from '@nestjs/jwt'
import * as web from '@/config/web-instance'
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
        ConfigModule.forRoot({ isGlobal: true, cache: true }),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                global: true,
                secret: config.get('JWT_SECRET')
            })
        })
    ],
    controllers: [],
    providers: [ConfigService, JwtService],
    exports: [ConfigService, JwtService]
})
export class ConfigerModule {}
