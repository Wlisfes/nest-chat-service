import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { NodemailerService } from '@/services/nodemailer/nodemailer.service'
import { RedisService } from '@/services/redis/redis.service'
import { CustomService } from '@/services/custom.service'
import { divineResolver, divineIntNumber, divineHandler, divineLogger } from '@/utils/utils-common'
import { divineSelection } from '@/utils/utils-typeorm'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'
import { UserEntier } from '@/entities/user'

@Injectable()
export class NotificationService {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger, private readonly custom: CustomService) {}

    /**通知列表**/
    public async httpNotificationColumn(headers: env.Headers, uid: string) {
        return await this.custom.divineBuilder(this.custom.tableNotification, async qb => {
            qb.leftJoinAndMapOne('t.sender', UserEntier, 'sender', 'sender.uid = t.uid')
            qb.leftJoinAndMapOne('t.receive', UserEntier, 'receive', 'receive.uid = t.cuid')
            qb.select([
                ...divineSelection('t', ['keyId', 'createTime', 'updateTime', 'source', 'uid', 'cuid', 'csid', 'status']),
                ...divineSelection('sender', ['uid', 'nickname', 'avatar', 'status']),
                ...divineSelection('receive', ['uid', 'nickname', 'avatar', 'status'])
            ])
            qb.where('t.uid = :uid OR t.cuid = :uid', { uid })
            return await qb.getManyAndCount().then(async ([total = 0, list = []]) => {
                return await divineResolver({ total, list })
            })
        })
    }
}
