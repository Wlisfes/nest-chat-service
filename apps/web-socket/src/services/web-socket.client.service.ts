import { Injectable } from '@nestjs/common'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class WebSocketClientService {
    private readonly client: Map<string, env.AuthSocket> = new Map()

    public async setClient(userId: string, socket: env.AuthSocket) {
        return this.client.set(userId, socket)
    }

    public async getClient(userId: string) {
        return this.client.get(userId)
    }

    public async delClient(userId: string) {
        return this.client.delete(userId)
    }
}
