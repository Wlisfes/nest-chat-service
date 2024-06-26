import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { CustomService } from '@/services/custom.service'
import { InitializeService } from '@/services/initialize.service'
import {
    UserEntier,
    MediaEntier,
    ContactEntier,
    WallpaperEntier,
    CommunitEntier,
    CommunitMemberEntier,
    SessionEntier,
    NotificationEntier,
    MessagerEntier,
    MessagerMediaEntier,
    MessagerReadEntier,
    LoggerEntier
} from '@/entities/instance'

export const forEntities = [
    UserEntier,
    MediaEntier,
    ContactEntier,
    WallpaperEntier,
    CommunitEntier,
    CommunitMemberEntier,
    SessionEntier,
    NotificationEntier,
    MessagerEntier,
    MessagerMediaEntier,
    MessagerReadEntier,
    LoggerEntier
]

@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return {
                    type: config.get('ORM_TYPE'),
                    host: config.get('ORM_HOST'),
                    port: config.get('ORM_PORT'),
                    username: config.get('ORM_USERNAME'),
                    password: config.get('ORM_PASSWORD'),
                    database: config.get('ORM_DATABASE'),
                    charset: config.get('ORM_CHARSET'),
                    synchronize: true,
                    entities: forEntities
                } as TypeOrmModuleOptions
            }
        }),
        TypeOrmModule.forFeature(forEntities)
    ],
    providers: [CustomService, InitializeService],
    exports: [CustomService]
})
export class DatabaseModule {}
