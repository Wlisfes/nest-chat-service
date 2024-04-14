import { Injectable, Inject, forwardRef, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { Brackets, In } from 'typeorm'
import { CustomService } from '@/services/custom.service'
import { NotificationService } from '@/services/notification.service'
import { SessionService } from '@/services/session.service'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineResolver, divineIntNumber, divineLogger, divineHandler } from '@/utils/utils-common'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class ContactService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        @Inject(forwardRef(() => NotificationService)) private readonly notificationService: NotificationService,
        private readonly custom: CustomService,
        private readonly session: SessionService
    ) {}

    /**申请添加好友**/
    public async httpContactInvite(headers: env.Headers, userId: string, { niveId }: env.BodyContactInvite) {
        const manager = await this.custom.divineConnectTransaction()
        try {
            await divineCatchWherer(userId === niveId, { message: '不能申请自己添加好友' })
            /**验证是否存在绑定好友关系、以及申请目标用户是否存在**/
            await this.custom.divineBuilder(this.custom.tableContact, async qb => {
                qb.where('(t.userId = :userId AND t.niveId = :niveId) OR (t.userId = :niveId AND t.userId = :userId)', { userId, niveId })
                return qb.getOne().then(async node => {
                    if (node) {
                        this.logger.info(
                            [ContactService.name, this.httpContactInvite.name].join(':'),
                            divineLogger(headers, { message: '存在好友', node })
                        )
                    }
                    return await divineCatchWherer(node && node.status === 'enable', {
                        message: '该用户已经是您的好友了，无法重复添加'
                    }).then(async () => {
                        return await this.custom.divineHaver(this.custom.tableUser, {
                            headers,
                            message: '账号不存在',
                            dispatch: { where: { uid: niveId } }
                        })
                    })
                })
            })
            /**处理申请记录**/
            return await this.custom.divineBuilder(this.custom.tableNotification, async qb => {
                qb.where(
                    '(t.userId = :userId AND t.niveId = :niveId AND t.source = :source) OR (t.userId = :niveId AND t.niveId = :userId AND t.source = :source)',
                    { source: 'contact', userId, niveId }
                )
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
                            state: { userId, niveId, status: 'waitze' }
                        })
                        return await manager.commitTransaction().then(async () => {
                            this.logger.info(
                                [ContactService.name, this.httpContactInvite.name].join(':'),
                                divineLogger(headers, { message: '申请好友成功', userId, niveId })
                            )
                            return await divineResolver({ message: '申请成功' })
                        })
                    } else {
                        /**不存在申请记录、新增一条申请记录**/
                        const data = await this.custom.divineCreate(this.custom.tableNotification, {
                            headers,
                            state: {
                                uid: await divineIntNumber(),
                                source: 'contact',
                                status: 'waitze',
                                userId,
                                niveId
                            }
                        })
                        return await manager.commitTransaction().then(async () => {
                            this.logger.info(
                                [ContactService.name, this.httpContactInvite.name].join(':'),
                                divineLogger(headers, { message: '申请好友成功', node: data })
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

    /**好友列表**/
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
