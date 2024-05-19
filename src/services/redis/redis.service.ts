import { Injectable, Inject } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { LoggerService, Logger } from '@/services/logger.service'
import { CLIENT_REDIS, ClientRedis } from '@/services/redis/redis.provider'
import { divineHandler } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class RedisService extends LoggerService {
    constructor(@Inject(CLIENT_REDIS) public readonly client: ClientRedis) {
        super()
    }

    @Cron('45 * * * * *')
    public async divineCronHandler() {
        return await this.client.ping()
    }

    /**redis存储**/
    @Logger
    public async setStore(headers: env.Headers, scope: { key: string; data: any; seconds?: number; logger?: boolean }) {
        if (scope.seconds > 0) {
            return await this.client.set(scope.key, JSON.stringify(scope.data), 'EX', scope.seconds).then(async value => {
                await divineHandler(scope.logger ?? true, {
                    handler: () => this.logger.info({ message: 'Redis存储', ...scope })
                })
                return value
            })
        } else {
            return await this.client.set(scope.key, JSON.stringify(scope.data)).then(async value => {
                await divineHandler(scope.logger ?? true, {
                    handler: () => this.logger.info({ message: 'Redis存储', ...scope })
                })
                return value
            })
        }
    }

    /**redis读取**/
    @Logger
    public async getStore<T>(headers: env.Headers, scope: { key: string; defaultValue?: T; logger?: boolean }): Promise<T> {
        return await this.client.get(scope.key).then(async data => {
            const value = data ? JSON.parse(data) : scope.defaultValue
            await divineHandler(scope.logger ?? true, {
                handler: () => this.logger.info({ message: 'Redis读取', ...scope, data })
            })
            return value
        })
    }

    /**redis批量读取**/
    @Logger
    public async mgetStore(headers: env.Headers, scope: { keys: Array<string>; logger?: boolean }) {
        return await this.client.mget(scope.keys).then(async data => {
            const values = scope.keys.map((key, index) => ({ key, value: data[index] ?? false }))
            await divineHandler(scope.logger ?? true, {
                handler: () => this.logger.info({ message: 'Redis批量读取', values })
            })
            return values
        })
    }

    /**redis删除**/
    @Logger
    public async delStore(headers: env.Headers, scope: { key: string; logger?: boolean }) {
        return await this.client.del(scope.key).then(async value => {
            await divineHandler(scope.logger ?? true, {
                handler: () => this.logger.info({ message: 'Redis删除', ...scope })
            })
            return value
        })
    }
}
