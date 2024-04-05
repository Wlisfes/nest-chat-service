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

    /**新建会话**/
    public async httpSessionCreater(headers: env.Headers, uid: string, scope: env.BodySessionCreater) {
        try {
            return await this.custom.divineWithTransaction(async manager => {
                const creator = await this.custom.divineHaver(this.custom.tableUser, {
                    headers,
                    message: '账号不存在',
                    dispatch: {
                        where: { uid },
                        select: { keyId: true, nickname: true, uid: true }
                    }
                })
                if (scope.source === 'private') {
                    const contact = await this.custom.divineHaver(this.custom.tableContact, {
                        headers,
                        message: '联系人不存在',
                        dispatch: {
                            where: { uid: scope.contact, status: 'enable' },
                            select: { keyId: true, uid: true }
                        }
                    })
                    await this.custom.divineBuilder(this.custom.tableSession, async qb => {
                        qb.innerJoin('t.contact', 's1')
                        qb.where('s1.uid = :contact', { contact: contact.uid })
                        const node = await qb.getOne()
                        return await divineCatchWherer(Boolean(node), { message: '该联系人会话已存在' })
                    })
                    const session = await this.custom.divineCreate(this.custom.tableSession, {
                        headers,
                        manager: true,
                        state: { sid: await divineIntNumber(), source: scope.source, contact, creator }
                    })
                    return await manager.save(session).then(async () => {
                        this.logger.info(
                            [SessionService.name, this.httpSessionCreater.name].join(':'),
                            divineLogger(headers, { message: '新建会话成功', source: scope.source, creator, contact })
                        )
                        return await divineResolver({ message: '新建成功' })
                    })
                } else if (scope.source === 'communit') {
                    const communit = await this.custom.divineHaver(this.custom.tableCommunit, {
                        headers,
                        message: '社群不存在',
                        dispatch: {
                            where: { uid: scope.communit },
                            select: { keyId: true, name: true, uid: true }
                        }
                    })
                    await this.custom.divineBuilder(this.custom.tableSession, async qb => {
                        qb.innerJoin('t.communit', 's1')
                        qb.where('s1.uid = :communit', { contact: communit.uid })
                        const node = await qb.getOne()
                        return await divineCatchWherer(Boolean(node), { message: '该社群会话已存在' })
                    })
                    const session = await this.custom.divineCreate(this.custom.tableSession, {
                        headers,
                        manager: true,
                        state: { sid: await divineIntNumber(), source: scope.source, communit, creator }
                    })
                    return await manager.save(session).then(async () => {
                        this.logger.info(
                            [SessionService.name, this.httpSessionCreater.name].join(':'),
                            divineLogger(headers, { message: '新建会话成功', source: scope.source, creator, communit })
                        )
                        return await divineResolver({ message: '新建成功' })
                    })
                }
                throw new HttpException('会话类型错误', HttpStatus.BAD_REQUEST)
            })
        } catch (e) {
            this.logger.error(
                [SessionService.name, this.httpSessionCreater.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**会话列表**/
    public async httpSessionColumner(headers: env.Headers, uid: string) {
        try {
            const [list = [], total = 0] = await this.custom.divineBuilder(this.custom.tableSession, async qb => {
                qb.leftJoinAndSelect('t.creator', 'creator')
                qb.leftJoinAndSelect('t.contact', 'contact')
                qb.leftJoinAndSelect('contact.sender', 'sender')
                qb.leftJoinAndSelect('contact.receive', 'receive')
                qb.leftJoinAndSelect('t.communit', 'communit')
                qb.where('creator.uid = :uid', { uid })
                return qb.getManyAndCount()
            })
            return await divineResolver({ total, list })
        } catch (e) {
            this.logger.error(
                [SessionService.name, this.httpSessionColumner.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
