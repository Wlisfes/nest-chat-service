import { Injectable } from '@nestjs/common'
import { AuthSocket } from '@web-socket/web-socket.resolver'

@Injectable()
export class WebSocketClientService {
    private readonly client: Map<string, AuthSocket> = new Map()

    public async setClient(userId: string, socket: AuthSocket) {
        return this.client.set(userId, socket)
    }

    public async getClient(userId: string) {
        return this.client.get(userId)
    }

    public async delClient(userId: string) {
        return this.client.delete(userId)
    }
}
