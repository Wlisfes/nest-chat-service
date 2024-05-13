import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { isNotEmpty } from 'class-validator'
import { CustomService } from '@/services/custom.service'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineSelection } from '@/utils/utils-typeorm'
import { divineResolver, divineIntNumber, divineLogger, divineHandler, divineCaseWherer, divineMaskCharacter } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class ContactService {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger, private readonly customService: CustomService) {}

    /**申请添加好友**/
    public async httpContactInviteJoiner(headers: env.Headers, userId: string, scope: env.BodyContactInvite) {
        const connect = await this.customService.divineConnectTransaction()
        try {
            await divineCatchWherer(userId === scope.niveId, { message: '不能申请自己添加好友' })
            /**验证是否存在绑定好友关系、以及申请目标用户是否存在**/
            await this.customService.divineBuilder(this.customService.tableContact, async qb => {
                qb.where(
                    '((t.userId = :userId AND t.niveId = :niveId) OR (t.userId = :niveId AND t.userId = :userId)) AND t.status = :status',
                    {
                        userId: userId,
                        niveId: scope.niveId,
                        status: entities.EnumContactStatus.enable
                    }
                )
                return qb.getOne().then(async node => {
                    await divineHandler(Boolean(node), {
                        handler: async () => {
                            this.logger.info(
                                [ContactService.name, this.httpContactInviteJoiner.name].join(':'),
                                divineLogger(headers, { message: '存在好友绑定关系', node })
                            )
                            return await divineCatchWherer(node.status === entities.EnumContactStatus.enable, {
                                message: '该用户已经是您的好友了，无法重复添加'
                            })
                        }
                    })
                    return await this.customService.divineHaver(this.customService.tableUser, {
                        headers,
                        message: '账号不存在',
                        dispatch: { where: { uid: scope.niveId } }
                    })
                })
            })
            /**处理申请记录**/
            return await this.customService.divineBuilder(this.customService.tableNotification, async qb => {
                qb.where(
                    '((t.userId = :userId AND t.niveId = :niveId) OR (t.userId = :niveId AND t.niveId = :userId)) AND t.source = :source',
                    {
                        userId: userId,
                        niveId: scope.niveId,
                        source: entities.EnumNotificationSource.contact
                    }
                )
                return await qb.getOne().then(async node => {
                    /**输出申请记录日志**/
                    await divineHandler(Boolean(node), {
                        handler: () => {
                            this.logger.info(
                                [ContactService.name, this.httpContactInviteJoiner.name].join(':'),
                                divineLogger(headers, { message: '存在申请记录', node })
                            )
                            if (node.userId !== userId && node.status === entities.EnumNotificationStatus.waitze) {
                                throw new HttpException(`该用户已向您发出添加好友请求，无需再次发起申请`, HttpStatus.BAD_REQUEST)
                            }
                        }
                    })
                    if (Boolean(node) && node.status === entities.EnumNotificationStatus.waitze) {
                        /**存在申请记录、并且是待处理状态**/
                        await this.customService.divineUpdate(this.customService.tableNotification, {
                            headers,
                            where: { keyId: node.keyId },
                            state: {
                                json: { [userId]: { uid: userId, comment: scope.comment, date: Date.now() } }
                            }
                        })
                    } else if (Boolean(node)) {
                        /**存在申请记录、并且不是待处理状态**/
                        await this.customService.divineUpdate(this.customService.tableNotification, {
                            headers,
                            where: { keyId: node.keyId },
                            state: {
                                userId: userId,
                                niveId: scope.niveId,
                                command: [scope.niveId],
                                json: { [userId]: { uid: userId, comment: scope.comment, date: Date.now() } }
                            }
                        })
                    } else {
                        /**不存在申请记录**/
                        await this.customService.divineCreate(this.customService.tableNotification, {
                            headers,
                            state: {
                                uid: await divineIntNumber(),
                                source: entities.EnumNotificationSource.contact,
                                status: entities.EnumNotificationStatus.waitze,
                                userId: userId,
                                niveId: scope.niveId,
                                command: [scope.niveId],
                                json: {
                                    [userId]: { uid: userId, comment: scope.comment, date: Date.now() }
                                }
                            }
                        })
                    }
                    return await connect.commitTransaction().then(async () => {
                        this.logger.info(
                            [ContactService.name, this.httpContactInviteJoiner.name].join(':'),
                            divineLogger(headers, { message: '申请好友成功', userId, niveId: scope.niveId })
                        )
                        return await divineResolver({ message: '申请成功' })
                    })
                })
            })
        } catch (e) {
            await connect.rollbackTransaction()
            this.logger.error(
                [ContactService.name, this.httpContactInviteJoiner.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        } finally {
            await connect.release()
        }
    }

    /**关键字列表搜索**/
    public async httpContactSearch(headers: env.Headers, userId: string, scope: env.BodyContactSearch) {
        try {
            return await this.customService.divineBuilder(this.customService.tableUser, async qb => {
                if (isNotEmpty(scope.keyword)) {
                    qb.where('t.uid != :userId AND (t.uid LIKE :uid OR t.email LIKE :email OR t.nickname LIKE :nickname)', {
                        userId: userId,
                        uid: `%${scope.keyword}%`,
                        email: `%${scope.keyword}%`,
                        nickname: `%${scope.keyword}%`
                    })
                } else {
                    qb.where('t.uid != :userId', { userId: userId })
                }
                qb.select(divineSelection('t', ['keyId', 'uid', 'nickname', 'avatar', 'status', 'email', 'comment']))
                qb.skip(0)
                qb.take(100)
                qb.cache(5000)
                qb.orderBy('t.keyId', 'DESC')
                return qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                    const mask = list.map(async item => ({ ...item, email: await divineMaskCharacter('email', item.email) }))
                    return await divineResolver({ total, list: await Promise.all(mask) })
                })
            })
        } catch (e) {
            this.logger.error(
                [ContactService.name, this.httpContactSearch.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**好友列表**/
    public async httpContactColumn(headers: env.Headers, userId: string) {
        try {
            return await this.customService.divineBuilder(this.customService.tableContact, async qb => {
                qb.leftJoinAndMapOne('t.user', entities.UserEntier, 'user', 'user.uid = t.userId')
                qb.leftJoinAndMapOne('t.nive', entities.UserEntier, 'nive', 'nive.uid = t.niveId')
                qb.select([
                    ...divineSelection('t', ['keyId', 'uid', 'createTime', 'updateTime', 'status', 'userId', 'niveId']),
                    ...divineSelection('user', ['uid', 'nickname', 'avatar', 'status']),
                    ...divineSelection('nive', ['uid', 'nickname', 'avatar', 'status'])
                ])
                qb.where('t.userId = :userId OR t.niveId = :userId', { userId })
                return qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                    return await divineResolver({ total, list })
                })
            })
        } catch (e) {
            this.logger.error(
                [ContactService.name, this.httpContactColumn.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**好友关系详情**/
    public async httpContactResolver(headers: env.Headers, userId: string, scope: env.QueryContactResolver) {
        try {
            return await this.customService.divineBuilder(this.customService.tableContact, async qb => {
                qb.leftJoinAndMapOne('t.user', entities.UserEntier, 'user', 'user.uid = t.userId')
                qb.leftJoinAndMapOne('t.nive', entities.UserEntier, 'nive', 'nive.uid = t.niveId')
                qb.select([
                    ...divineSelection('t', ['keyId', 'uid', 'createTime', 'updateTime', 'status', 'userId', 'niveId']),
                    ...divineSelection('user', ['uid', 'nickname', 'avatar', 'status']),
                    ...divineSelection('nive', ['uid', 'nickname', 'avatar', 'status'])
                ])
                qb.where('t.uid = :uid AND (t.userId = :userId OR t.niveId = :userId)', {
                    userId: userId,
                    uid: scope.uid
                })
                qb.cache(5000)
                return qb.getOne().then(async node => {
                    await this.customService.divineCatchWherer(!Boolean(node), node, {
                        message: '该用户不是您的好友，无法查看详情'
                    })
                    return await divineResolver(node)
                })
            })
        } catch (e) {
            this.logger.error(
                [ContactService.name, this.httpContactResolver.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
