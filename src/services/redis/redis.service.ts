import { Injectable, Inject } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CLIENT_REDIS, ClientRedis } from '@/services/redis/redis.provider'
import { divineLogger } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class RedisService {
    constructor(
        @Inject(CLIENT_REDIS) public readonly client: ClientRedis,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {}

    @Cron('45 * * * * *')
    public async divineCronHandler() {
        return await this.client.ping()
    }

    /**redis存储**/
    public async setStore(key: string, data: any, seconds?: number, headers?: env.Headers) {
        if (seconds > 0) {
            return await this.client.set(key, JSON.stringify(data), 'EX', seconds).then(value => {
                this.logger.info(
                    [RedisService.name, this.setStore.name].join(':'),
                    divineLogger(headers, { message: 'Redis存储', key, seconds, value: data })
                )
                return value
            })
        } else {
            return await this.client.set(key, JSON.stringify(data)).then(value => {
                this.logger.info(
                    [RedisService.name, this.setStore.name].join(':'),
                    divineLogger(headers, { message: 'Redis存储', key, value: data })
                )
                return value
            })
        }
    }

    /**redis读取**/
    public async getStore<T>(key: string, defaultValue?: T, headers?: env.Headers): Promise<T> {
        return await this.client.get(key).then(data => {
            const value = data ? JSON.parse(data) : defaultValue
            this.logger.info([RedisService.name, this.getStore.name].join(':'), divineLogger(headers, { message: 'Redis读取', key, value }))
            return value
        })
    }

    /**redis删除**/
    public async delStore(key: string, headers?: env.Headers) {
        return await this.client.del(key).then(value => {
            this.logger.info([RedisService.name, this.delStore.name].join(':'), divineLogger(headers, { message: 'Redis删除', key, value }))
            return value
        })
    }
}
