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

    /**更新通知状态**/
    public async httpNotificationUpdate(headers: env.Headers, uid: string) {}

    /**通知列表**/
    public async httpNotificationColumn(headers: env.Headers, userId: string) {
        return await this.custom.divineBuilder(this.custom.tableNotification, async qb => {
            qb.leftJoinAndMapOne('t.user', UserEntier, 'user', 'user.uid = t.userId')
            qb.leftJoinAndMapOne('t.nive', UserEntier, 'nive', 'nive.uid = t.niveId')
            qb.select([
                ...divineSelection('t', ['keyId', 'uid', 'createTime', 'updateTime', 'source', 'userId', 'niveId', 'communitId', 'status']),
                ...divineSelection('user', ['uid', 'nickname', 'avatar', 'status']),
                ...divineSelection('nive', ['uid', 'nickname', 'avatar', 'status'])
            ])
            qb.where('t.userId = :userId OR t.niveId = :userId', { userId })
            return await qb.getManyAndCount().then(async ([total = 0, list = []]) => {
                return await divineResolver({ total, list })
            })
        })
    }
}
