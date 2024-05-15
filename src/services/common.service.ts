import { Injectable } from '@nestjs/common'
import { Response } from 'express'
import { LoggerService, Logger } from '@/services/logger.service'
import { RedisService } from '@/services/redis/redis.service'
import { CustomService } from '@/services/custom.service'
import { divineSelection } from '@/utils/utils-typeorm'
import { divineResolver, divineIntNumber, divineKeyCompose } from '@/utils/utils-common'
import { divineGrapher } from '@/utils/utils-plugin'
import * as web from '@/config/web-instance'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class CommonService extends LoggerService {
    constructor(private readonly customService: CustomService, private readonly redisService: RedisService) {
        super()
    }

    /**图形验证码**/
    @Logger
    public async httpCommonGrapher(headers: env.Headers, response: Response) {
        const { text, data } = await divineGrapher({ width: 120, height: 40 })
        const sid = await divineIntNumber()
        const key = await divineKeyCompose(web.CHAT_CHAHE_GRAPH_COMMON, sid)
        return await this.redisService.setStore(key, text, 3 * 60, headers).then(async () => {
            this.logger.info({ message: '图形验证码发送成功', seconds: 5 * 60, key, text })
            await response.cookie(web.WEB_COMMON_HEADER_CAPHCHA, sid, { httpOnly: true })
            await response.type('svg')
            return await response.send(data)
        })
    }

    /**颜色背景列表**/
    @Logger
    public async httpCommonWallpaper(headers: env.Headers) {
        return await this.customService.divineBuilder(this.customService.tableWallpaper, async qb => {
            qb.select(divineSelection('t', ['waid', 'light', 'dark']))
            qb.cache(60000)
            return qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                return await divineResolver({ total, list })
            })
        })
    }
}
