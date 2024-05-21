import { Injectable } from '@nestjs/common'
import { divineHandler } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class WebPeerClientService {
    public readonly client: Map<string, env.Omix<env.AuthClient>> = new Map()

    public async getClient(userId: string) {
        return this.client.get(userId)
    }

    public async delClient(userId: string) {
        return this.client.delete(userId)
    }

    public async setClient(userId: string, client: env.AuthClient) {
        return await this.disconnect(userId, true).then(() => {
            return this.client.set(userId, client)
        })
    }

    /**关闭实例**/
    public async disconnect(userId: string, where: boolean) {
        const client = await this.getClient(userId)
        return await divineHandler(Boolean(client) && where, {
            handler: async () => {
                const socket = client.getSocket()
                if (socket) {
                    socket.close()
                }
                return await this.delClient(userId)
            }
        })
    }
}
