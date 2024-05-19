import { Injectable } from '@nestjs/common'
import { RedisService } from '@/services/redis/redis.service'
import { LoggerService, Logger } from '@/services/logger.service'
import { divineKeyCompose } from '@/utils/utils-common'
import * as web from '@/config/web-instance'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class WebSocketCommonService extends LoggerService {
    constructor(private readonly redisService: RedisService) {
        super()
    }

    /**设置用户在线、离线**/
    @Logger
    public async fetchSocketUserOnline(headers: env.Headers, userId: string, online: boolean) {
        const keyName = await divineKeyCompose(web.CHAT_CHAHE_USER_ONLINE, userId)
        return await this.redisService.setStore(keyName, online, 0, headers)
    }
}
