import { Injectable, HttpStatus } from '@nestjs/common'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class WebSocketClientService {
    private readonly client: Map<string, env.AuthSocket> = new Map()

    /**抛出中断消息**/
    public async closure(socket: env.AuthSocket) {
        return await socket.emit('closure', { message: '挤出', status: HttpStatus.FORBIDDEN })
    }

    /**关闭实例**/
    public async disconnect(userId: string) {
        const socket = await this.getClient(userId)
        if (socket && socket.connected) {
            await this.closure(socket)
            await socket.disconnect()
        } else if (socket) {
            return await this.delClient(userId)
        }
        return undefined
    }

    /**存储实例**/
    public async setClient(userId: string, socket: env.AuthSocket) {
        await this.disconnect(userId)
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