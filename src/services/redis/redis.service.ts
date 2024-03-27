import { Injectable, Inject } from '@nestjs/common'
import { CLIENT_REDIS, ClientRedis } from '@/services/redis/redis.provider'

@Injectable()
export class RedisService {
    constructor(@Inject(CLIENT_REDIS) public readonly client: ClientRedis) {}

    /**redis存储**/
    public async setStore(key: string, data: any, seconds?: number) {
        if (!seconds) {
            return await this.client.set(key, JSON.stringify(data))
        } else {
            return await this.client.set(key, JSON.stringify(data), 'EX', seconds)
        }
    }

    /**redis读取**/
    public async getStore<T>(key: string, defaultValue?: T): Promise<T> {
        const data = await this.client.get(key)
        return data ? JSON.parse(data) : defaultValue
    }

    /**redis删除**/
    public async delStore(key: string) {
        return this.client.del(key)
    }
}
