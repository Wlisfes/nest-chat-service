import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CustomService } from '@/services/custom.service'
import { RedisService } from '@/services/redis/redis.service'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineResolver, divineIntNumber, divineLogger, divineHandler } from '@/utils/utils-common'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class SessionService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly custom: CustomService,
        private readonly redis: RedisService
    ) {}

    /**会话列表**/
    public async httpSessionColumner(headers: env.Headers, uid: string) {
        try {
            return await this.custom.divineBuilder(this.custom.tableSession, async qb => {
                // qb.leftJoinAndSelect('t.members', 'members1')
                qb.leftJoinAndSelect('t.communit', 'communit')
                qb.innerJoin('t.members', 'members', 'members.uid = :uid', { uid })
                return qb.getMany()
            })
        } catch (e) {
            this.logger.error(
                [SessionService.name, this.httpSessionColumner.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
