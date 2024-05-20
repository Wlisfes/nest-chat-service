import { Injectable, HttpStatus } from '@nestjs/common'
import { RedisSubscribeService, Subscribe } from '@/services/redis/redis.subscribe.service'
import { divineDelay, divineHandler } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class WebPeerClientService extends RedisSubscribeService {
    public readonly client: Map<string, env.AuthClient> = new Map()

    public async getClient(userId: string) {
        return this.client.get(userId)
    }

    public async delClient(userId: string) {
        return this.client.delete(userId)
    }

    public async setClient(userId: string, client: env.AuthClient) {
        await this.disconnect(userId)
        return this.client.set(userId, client)
    }

    /**关闭实例**/
    public async disconnect(userId: string) {
        const client = await this.getClient(userId)
        return await divineHandler(Boolean(client), {
            handler: async () => {
                await client.getSocket().close()
                return await this.delClient(userId)
            }
        })
    }
}
