import { Injectable, HttpStatus } from '@nestjs/common'
import { Server } from 'socket.io'
import { RedisSubscribeService, Subscribe } from '@/services/redis/redis.subscribe.service'
import { divineDelay, divineHandler } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class WebSocketClientService extends RedisSubscribeService {
    public readonly client: Map<string, env.AuthSocket> = new Map()
    public server: Server

    /**存储Socket运行实例**/
    public async setServer(server: Server) {
        return (this.server = server)
    }

    public async getClient(userId: string) {
        return this.client.get(userId)
    }

    public async delClient(userId: string) {
        return this.client.delete(userId)
    }

    /**抛出中断消息**/
    public async closure(userId: string) {
        const socket = await this.getClient(userId)
        return await divineHandler(socket && socket.connected, {
            handler: async () => {
                return await socket.emit('server-socket-closure', {
                    message: '当前账户已从其他设备登录，请重新登录',
                    status: HttpStatus.FORBIDDEN
                })
            }
        })
    }

    /**关闭实例**/
    public async disconnect(userId: string) {
        const socket = await this.getClient(userId)
        await divineHandler(socket && socket.connected, {
            handler: async () => {
                await this.closure(userId)
                return await socket.disconnect()
            }
        })
        return await this.delClient(userId)
    }

    /**存储实例**/
    public async setClient(userId: string, socket: env.AuthSocket) {
        await this.fetchSocketHandler('connection', socket)
        await this.disconnect(userId)
        return this.client.set(userId, socket)
    }

    /**socket连接事件广播**/
    public async fetchSocketHandler(type: 'connection', socket: env.AuthSocket) {
        this.pubClient.publish('web-socket.server', JSON.stringify({ type, pid: process.pid, uid: socket.user.uid }))
        return await divineDelay(0).then(() => socket)
    }

    @Subscribe('web-socket.server')
    private async fetchSocketSubscribe(channel: string, message: env.Omix<{ type: string; pid: number; uid: string }>) {
        return await divineHandler(channel === 'web-socket.server' && message.pid !== process.pid, {
            handler: async () => {
                return await this.disconnect(message.uid)
            }
        })
    }
}
