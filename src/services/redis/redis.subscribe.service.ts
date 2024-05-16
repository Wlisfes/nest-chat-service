import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '@/services/logger.service'
import Redis from 'ioredis'

export function Subscribe(channelName: string) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value
        // 在类的实例中存储订阅的频道和处理函数
        if (!target.subscribedChannels) {
            target.subscribedChannels = {}
        }
        target.subscribedChannels[channelName] = originalMethod
        descriptor.value = function (...args: any[]) {
            return originalMethod.apply(this, args)
        }
    }
}

@Injectable()
export class RedisSubscribeService extends LoggerService {
    protected readonly pubClient: Redis
    protected readonly subClient: Redis
    protected readonly configService: ConfigService = new ConfigService()
    protected readonly subscribedChannels: { [key: string]: Function }

    constructor() {
        super()
        this.subClient = new Redis({
            host: this.configService.get('REDIS_HOST'),
            port: this.configService.get('REDIS_PORT'),
            password: this.configService.get('REDIS_PASSWORD')
        })
        this.pubClient = this.subClient.duplicate()

        // 订阅所有在装饰器中指定的频道
        for (const channelName in this.subscribedChannels) {
            this.subClient.subscribe(channelName)
            this.subClient.on('message', (channel, message) => {
                // 如果订阅的频道存在于 subscribedChannels 中，则调用对应的处理函数
                if (this.subscribedChannels[channel]) {
                    this.subscribedChannels[channel].call(this, channel, JSON.parse(message))
                }
            })
        }
    }
}
