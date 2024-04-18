import { Injectable } from '@nestjs/common'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class WebSocketClientService {
    private readonly client: Map<string, env.AuthSocket> = new Map()

    private async closure(userId: string) {
        const socket = await this.getClient(userId)
        if (socket && socket.connected) {
            await socket.disconnect()
        }
        return await this.delClient(userId)
    }

    public async setClient(userId: string, socket: env.AuthSocket) {
        const app = await this.getClient(userId)
        if (app && app.id !== socket.id && app.connected) {
        }
        await this.closure(userId)
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
