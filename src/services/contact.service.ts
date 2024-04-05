import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { Brackets, In } from 'typeorm'
import { CustomService } from '@/services/custom.service'
import { RedisService } from '@/services/redis/redis.service'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineResolver, divineIntNumber, divineLogger, divineHandler } from '@/utils/utils-common'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class ContactService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly custom: CustomService,
        private readonly redis: RedisService
    ) {}

    /**新增联系人**/
    public async httpContactCreater(headers: env.Headers, uid: string, scope: env.BodyContactCreater) {
        try {
            //prettier-ignore
            const contact = await this.custom.divineBuilder(this.custom.tableContact, async qb => {
                qb.leftJoin('t.sender', 's1')
                qb.leftJoin('t.receive', 's2')
                qb.where('s1.uid = :sender AND s2.uid = :receive', { sender: uid, receive: scope.uid })
                qb.orWhere('s1.uid = :receive AND s2.uid = :sender', { sender: uid, receive: scope.uid })
                return qb.getOne()
            })
            if (contact && contact.status === 'enable') {
                return await divineCatchWherer(true, { message: '该用户已经是您的联系人了，无法重复添加' })
            } else if (contact && contact.status === 'delete') {
                await this.custom.divineUpdate(this.custom.tableContact, {
                    where: { uid: contact.uid },
                    state: { status: 'enable' }
                })
                return await divineResolver({ message: '新增成功' })
            }
            return await this.custom.divineWithTransaction(async manager => {
                const sender = await this.custom.divineHaver(this.custom.tableUser, {
                    headers,
                    message: '账号不存在',
                    dispatch: { where: { uid } }
                })
                const receive = await this.custom.divineHaver(this.custom.tableUser, {
                    headers,
                    message: '账号不存在',
                    dispatch: { where: { uid: scope.uid } }
                })
                const node = await this.custom.divineCreate(this.custom.tableContact, {
                    headers,
                    manager: true,
                    state: {
                        uid: await divineIntNumber(),
                        status: 'enable',
                        sender,
                        receive
                    }
                })
                return await manager.save(node).then(async () => {
                    return await divineResolver({ message: '新增成功' })
                })
            })
        } catch (e) {
            this.logger.error(
                [ContactService.name, this.httpContactCreater.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
