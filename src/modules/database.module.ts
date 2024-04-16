import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { CustomService } from '@/services/custom.service'
import {
    UserEntier,
    MediaEntier,
    ContactEntier,
    CommunitEntier,
    CommunitMemberEntier,
    SessionEntier,
    NotificationEntier,
    MessagerEntier,
    MessagerMediaEntier
} from '@/entities/instance'

export const forEntities = [
    UserEntier,
    MediaEntier,
    ContactEntier,
    CommunitEntier,
    CommunitMemberEntier,
    SessionEntier,
    NotificationEntier,
    MessagerEntier,
    MessagerMediaEntier
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
    providers: [CustomService],
    exports: [CustomService]
})
export class DatabaseModule {}
