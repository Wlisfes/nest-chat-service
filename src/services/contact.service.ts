import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { Brackets, In } from 'typeorm'
import { CustomService } from '@/services/custom.service'
import { RedisService } from '@/services/redis/redis.service'
import { SessionService } from '@/services/session.service'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineResolver, divineIntNumber, divineLogger, divineHandler } from '@/utils/utils-common'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class ContactService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly custom: CustomService,
        private readonly redis: RedisService,
        private readonly session: SessionService
    ) {}

    /**申请添加联系人**/
    public async httpContactInvite(headers: env.Headers, uid: string, { cuid }: env.BodyContactInvite) {
        const manager = await this.custom.divineConnectTransaction()
        try {
            await this.custom.divineBuilder(this.custom.tableContact, async qb => {
                qb.where('t.uid = :uid AND t.cuid = :cuid', { uid, cuid })
                qb.orWhere('t.uid = :cuid AND t.uid = :uid', { uid, cuid })
                return qb.getOne().then(async node => {
                    if (node) {
                        this.logger.info(
                            [ContactService.name, this.httpContactInvite.name].join(':'),
                            divineLogger(headers, { message: '存在联系人', node })
                        )
                    }
                    return await divineCatchWherer(node && node.status === 'enable', {
                        message: '该用户已经是您的联系人了，无法重复添加'
                    }).then(async () => {
                        return await this.custom.divineHaver(this.custom.tableUser, {
                            headers,
                            message: '账号不存在',
                            dispatch: { where: { uid: cuid } }
                        })
                    })
                })
            })
            return await this.custom.divineBuilder(this.custom.tableNotification, async qb => {
                qb.where('t.uid = :uid AND t.cuid = :cuid', { uid, cuid })
                return qb.getOne().then(async node => {
                    if (node) {
                        this.logger.info(
                            [ContactService.name, this.httpContactInvite.name].join(':'),
                            divineLogger(headers, { message: '存在申请记录', node })
                        )
                        /**存在申请记录、通知状态切换到waitze-待处理**/
                        await this.custom.divineUpdate(this.custom.tableNotification, {
                            headers,
                            where: { keyId: node.keyId },
                            state: { status: 'waitze' }
                        })
                        return await manager.commitTransaction().then(async () => {
                            this.logger.info(
                                [ContactService.name, this.httpContactInvite.name].join(':'),
                                divineLogger(headers, { message: '申请联系人成功', uid, cuid })
                            )
                            return await divineResolver({ message: '申请成功' })
                        })
                    } else {
                        /**不存在申请记录、新增一条申请记录**/
                        const data = await this.custom.divineCreate(this.custom.tableNotification, {
                            headers,
                            state: { source: 'contact', status: 'waitze', uid, cuid }
                        })
                        return await manager.commitTransaction().then(async () => {
                            this.logger.info(
                                [ContactService.name, this.httpContactInvite.name].join(':'),
                                divineLogger(headers, { message: '申请联系人成功', node: data })
                            )
                            return await divineResolver({ message: '申请成功' })
                        })
                    }
                })
            })
        } catch (e) {
            await manager.rollbackTransaction()
            this.logger.error(
                [ContactService.name, this.httpContactInvite.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        } finally {
            await manager.release()
        }
    }

    /**新增联系人**/
    public async httpContactCreater(headers: env.Headers, uid: string, scope: env.BodyContactCreater) {
        try {
            // const contact = await this.custom.divineBuilder(this.custom.tableContact, async qb => {
            //     qb.leftJoin('t.sender', 's1')
            //     qb.leftJoin('t.receive', 's2')
            //     qb.where('s1.uid = :sender AND s2.uid = :receive', { sender: uid, receive: scope.uid })
            //     qb.orWhere('s1.uid = :receive AND s2.uid = :sender', { sender: uid, receive: scope.uid })
            //     return qb.getOne()
            // })
            // if (contact && contact.status === 'enable') {
            //     return await divineCatchWherer(true, { message: '该用户已经是您的联系人了，无法重复添加' })
            // } else if (contact && contact.status === 'delete') {
            //     await this.custom.divineUpdate(this.custom.tableContact, {
            //         headers,
            //         where: { uid: contact.uid },
            //         state: { status: 'enable' }
            //     })
            //     return await divineResolver({ message: '新增成功' })
            // }
            // return await this.custom.divineWithTransaction(async manager => {
            //     const sender = await this.custom.divineHaver(this.custom.tableUser, {
            //         headers,
            //         message: '账号不存在',
            //         dispatch: {
            //             where: { uid },
            //             select: { keyId: true, nickname: true, uid: true }
            //         }
            //     })
            //     const receive = await this.custom.divineHaver(this.custom.tableUser, {
            //         headers,
            //         message: '账号不存在',
            //         dispatch: {
            //             where: { uid: scope.uid },
            //             select: { keyId: true, nickname: true, uid: true }
            //         }
            //     })
            //     const node = await this.custom.divineCreate(this.custom.tableContact, {
            //         headers,
            //         manager: true,
            //         state: {
            //             uid: await divineIntNumber(),
            //             status: 'enable'
            //             // sender,
            //             // receive
            //         }
            //     })
            //     return await manager.save(node).then(async () => {
            //         this.logger.info(
            //             [ContactService.name, this.httpContactCreater.name].join(':'),
            //             divineLogger(headers, { message: '新增联系人成功', sender, receive })
            //         )
            //         return await divineResolver({ message: '新增成功' })
            //     })
            // })
        } catch (e) {
            this.logger.error(
                [ContactService.name, this.httpContactCreater.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**联系人列表**/
    public async httpContactColumner(headers: env.Headers, uid: string) {
        try {
            const [list = [], total = 0] = await this.custom.divineBuilder(this.custom.tableContact, async qb => {
                qb.leftJoin('t.sender', 's1')
                qb.leftJoin('t.receive', 's2')
                qb.leftJoinAndSelect('t.sender', 'sender')
                qb.leftJoinAndSelect('t.receive', 'receive')
                qb.where('(s1.uid = :sender) OR (s2.uid = :receive)', { sender: uid, receive: uid })
                return qb.getManyAndCount()
            })
            return await divineResolver({ total, list })
        } catch (e) {
            this.logger.error(
                [ContactService.name, this.httpContactColumner.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
