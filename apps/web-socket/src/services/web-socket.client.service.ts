import { Injectable } from '@nestjs/common'
import { divineHandler } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class WebSocketClientService {
    private readonly client: Map<string, env.AuthSocket> = new Map()

    public async closure(socket: env.AuthSocket) {
        await socket.disconnect()
        return await this.delClient(socket.user.uid)
    }

    public async setClient(userId: string, socket: env.AuthSocket) {
        const app = await this.getClient(userId)
        if (app && app.id === socket.id) {
            return this.client.set(userId, socket)
        } else if (app) {
            await divineHandler(app.connected, async () => {
                return await this.closure(app)
            })
            await this.delClient(userId)
        }
        return this.client.set(userId, socket)
    }

    public async getClient(userId: string) {
        return this.client.get(userId)
    }

    public async getAllClient() {
        return this.client
    }

    public async delClient(userId: string) {
        return this.client.delete(userId)
    }
}
