import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { isEmpty } from 'class-validator'
import { CustomService } from '@/services/custom.service'
import { MessagerService } from '@/services/messager.service'
import { divineSelection } from '@/utils/utils-typeorm'
import { RedisService } from '@/services/redis/redis.service'
import { divineResolver, divineIntNumber, divineLogger, divineKeyCompose, divineCaseWherer } from '@/utils/utils-common'
import * as web from '@/config/web-instance'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class SessionService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly customService: CustomService,
        private readonly redisService: RedisService,
        private readonly messagerService: MessagerService
    ) {}

    /**获取当前用户所有会话房间**/
    public async httpSocketConnection(headers: env.Headers, userId: string) {
        try {
            return await this.customService.divineBuilder(this.customService.tableSession, async qb => {
                qb.leftJoinAndMapOne('t.contact', entities.ContactEntier, 'contact', 'contact.uid = t.contactId')
                qb.leftJoinAndMapOne('t.communit', entities.CommunitEntier, 'communit', 'communit.uid = t.communitId')
                qb.leftJoinAndMapOne(
                    'communit.member',
                    entities.CommunitMemberEntier,
                    'member',
                    'member.communitId = communit.uid AND member.userId = :userId',
                    { userId: userId }
                )
                qb.where(`(contact.userId = :userId OR contact.niveId = :userId) OR (member.userId = :userId)`, {
                    userId: userId
                })
                return qb.getMany().then(async list => {
                    return await divineResolver(list.map(node => node.sid))
                })
            })
        } catch (e) {
            this.logger.error(
                [SessionService.name, this.httpSocketConnection.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**会话列表**/
    public async httpSessionColumn(headers: env.Headers, userId: string, scope: env.BodySessionColumn) {
        try {
            return await this.customService.divineBuilder(this.customService.tableSession, async qb => {
                /**私聊会话联查**/
                qb.leftJoinAndMapOne('t.contact', entities.ContactEntier, 'contact', 'contact.uid = t.contactId')
                qb.leftJoinAndMapOne('contact.user', entities.UserEntier, 'user', 'user.uid = contact.userId')
                qb.leftJoinAndMapOne('contact.nive', entities.UserEntier, 'nive', 'nive.uid = contact.niveId')
                /**消息记录联查**/
                qb.leftJoinAndMapOne(
                    't.message',
                    entities.MessagerEntier,
                    'message',
                    'message.sessionId = t.sid AND (message.status = :delivered OR message.userId = :userId)',
                    { userId: userId, delivered: entities.EnumMessagerStatus.delivered }
                )
                /**群聊会话联查**/
                qb.leftJoinAndMapOne('t.communit', entities.CommunitEntier, 'communit', 'communit.uid = t.communitId')
                qb.leftJoinAndMapOne('communit.poster', entities.MediaEntier, 'poster', 'communit.poster = poster.fileId')
                qb.leftJoinAndMapOne(
                    'communit.member',
                    entities.CommunitMemberEntier,
                    'member',
                    'member.communitId = communit.uid AND member.userId = :userId',
                    { userId: userId }
                )
                qb.select([
                    /**会话基础字段**/
                    ...divineSelection('t', ['sid', 'source', 'contactId', 'communitId']),
                    /**消息记录联查字段**/
                    ...divineSelection('message', ['keyId', 'createTime', 'sid', 'sessionId', 'userId', 'text', 'source', 'status']),
                    /**联系人联查字段**/
                    ...divineSelection('contact', ['uid', 'status', 'userId', 'niveId']),
                    ...divineSelection('user', ['uid', 'nickname', 'avatar', 'status']),
                    ...divineSelection('nive', ['uid', 'nickname', 'avatar', 'status']),
                    /**社群联查字段**/
                    ...divineSelection('communit', ['keyId', 'uid', 'poster', 'name', 'ownId', 'status', 'comment', 'speak']),
                    ...divineSelection('poster', ['keyId', 'width', 'height', 'fileId', 'fileURL']),
                    ...divineSelection('member', ['keyId', 'communitId', 'userId', 'role', 'status', 'speak'])
                ])
                qb.cache(5000)
                qb.where(
                    `((contact.userId = :userId OR contact.niveId = :userId) OR (member.userId = :userId)) AND t.source IN (:...source)`,
                    {
                        userId,
                        source: divineCaseWherer(Boolean(scope.source), {
                            value: [scope.source],
                            fallback: [entities.EnumSessionSource.contact, entities.EnumSessionSource.communit]
                        })
                    }
                )
                qb.orderBy('message.createTime', 'DESC')
                return qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                    return await divineResolver({
                        total,
                        list: await Promise.all(
                            list.map(async item => {
                                return Object.assign(item, {
                                    unread: await this.customService.divineBuilder(this.customService.tableMessager, async qb => {
                                        qb.leftJoinAndMapOne(
                                            't.read',
                                            entities.MessagerReadEntier,
                                            'read',
                                            'read.sid = t.sid AND read.userId = :userId',
                                            { userId: userId }
                                        )
                                        qb.select(divineSelection('t', ['sid', 'sessionId', 'source', 'status', 'userId']))
                                        qb.where('t.sessionId = :sessionId AND read.sid IS NULL', { sessionId: item.sid })
                                        return await qb.getMany()
                                    })
                                })
                            })
                        )
                    })
                })
            })
        } catch (e) {
            this.logger.error(
                [SessionService.name, this.httpSessionColumn.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**会话详情**/
    public async httpSessionOneResolver(headers: env.Headers, userId: string, scope: env.BodySessionOneResolver) {
        try {
            return await this.customService.divineBuilder(this.customService.tableSession, async qb => {
                /**私聊会话联查**/
                qb.leftJoinAndMapOne('t.contact', entities.ContactEntier, 'contact', 'contact.uid = t.contactId')
                qb.leftJoinAndMapOne('contact.user', entities.UserEntier, 'user', 'user.uid = contact.userId')
                qb.leftJoinAndMapOne('contact.nive', entities.UserEntier, 'nive', 'nive.uid = contact.niveId')
                /**消息记录联查**/
                qb.leftJoinAndMapOne(
                    't.message',
                    entities.MessagerEntier,
                    'message',
                    'message.sessionId = t.sid AND (message.status = :delivered OR message.userId = :userId)',
                    { userId: userId, delivered: entities.EnumMessagerStatus.delivered }
                )
                /**群聊会话联查**/
                qb.leftJoinAndMapOne('t.communit', entities.CommunitEntier, 'communit', 'communit.uid = t.communitId')
                qb.leftJoinAndMapOne('communit.poster', entities.MediaEntier, 'poster', 'communit.poster = poster.fileId')
                qb.leftJoinAndMapOne(
                    'communit.member',
                    entities.CommunitMemberEntier,
                    'member',
                    'member.communitId = communit.uid AND member.userId = :userId',
                    { userId: userId }
                )
                qb.select([
                    /**会话基础字段**/
                    ...divineSelection('t', ['sid', 'source', 'contactId', 'communitId']),
                    /**消息记录联查字段**/
                    ...divineSelection('message', ['keyId', 'createTime', 'sid', 'sessionId', 'userId', 'text', 'source', 'status']),
                    /**联系人联查字段**/
                    ...divineSelection('contact', ['uid', 'status', 'userId', 'niveId']),
                    ...divineSelection('user', ['uid', 'nickname', 'avatar', 'status']),
                    ...divineSelection('nive', ['uid', 'nickname', 'avatar', 'status']),
                    /**社群联查字段**/
                    ...divineSelection('communit', ['keyId', 'uid', 'poster', 'name', 'ownId', 'status', 'comment', 'speak']),
                    ...divineSelection('poster', ['keyId', 'width', 'height', 'fileId', 'fileURL']),
                    ...divineSelection('member', ['keyId', 'communitId', 'userId', 'role', 'status', 'speak'])
                ])
                qb.where('t.sid = :sid AND ((contact.userId = :userId OR contact.niveId = :userId) OR (member.userId = :userId))', {
                    userId: userId,
                    sid: scope.sid
                })
                return qb.getOne().then(async node => {
                    await this.customService.divineCatchWherer(isEmpty(node), null, {
                        message: '会话SID不存在'
                    })
                    return await divineResolver({
                        ...node,
                        unread: await this.customService.divineBuilder(this.customService.tableMessager, async qb => {
                            qb.leftJoinAndMapOne(
                                't.read',
                                entities.MessagerReadEntier,
                                'read',
                                'read.sid = t.sid AND read.userId = :userId',
                                { userId: userId }
                            )
                            qb.select(divineSelection('t', ['sid', 'sessionId', 'source', 'status', 'userId']))
                            qb.where('t.sessionId = :sessionId AND read.sid IS NULL', { sessionId: node.sid })
                            return await qb.getMany()
                        })
                    })
                })
            })
        } catch (e) {
            this.logger.error(
                [SessionService.name, this.httpSessionColumn.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**新建私聊会话**/
    public async httpSessionContactCreater(headers: env.Headers, scope: env.BodySessionContactCreater) {
        const connect = await this.customService.divineConnectTransaction()
        try {
            const contact = await this.customService.divineHaver(this.customService.tableContact, {
                headers,
                message: '好友不存在',
                dispatch: {
                    where: { uid: scope.contactId }
                }
            })
            return await this.customService.divineBuilder(this.customService.tableSession, async qb => {
                qb.where('t.contactId = :contactId AND t.source = :source', {
                    source: 'contact',
                    contactId: scope.contactId
                })
                return qb.getOne().then(async node => {
                    if (node) {
                        /**存在私聊会话记录**/
                        this.logger.info(
                            [SessionService.name, this.httpSessionContactCreater.name].join(':'),
                            divineLogger(headers, { message: '存在私聊会话记录', node })
                        )
                        return await divineResolver(node)
                    }
                    /**不存在私聊会话记录、新建一条会话**/
                    const result = await this.customService.divineCreate(this.customService.tableSession, {
                        headers,
                        state: {
                            source: 'contact',
                            contactId: scope.contactId,
                            sid: await divineIntNumber()
                        }
                    })
                    /**插入打招呼消息语句**/
                    const key = await divineKeyCompose(web.CHAT_CHAHE_USER_RESOLVER, contact.userId)
                    const user = await this.redisService.getStore(key, null, headers)
                    /**插入申请用户招呼记录**/
                    await this.messagerService.httpCommonCustomizeMessager(headers, contact.userId, {
                        source: entities.EnumMessagerSource.text,
                        referrer: entities.EnumMessagerReferrer.http,
                        sessionId: result.sid,
                        text: `我是${user.nickname}`,
                        fileId: ''
                    })
                    /**插入被申请用户招呼记录**/
                    await this.messagerService.httpCommonCustomizeMessager(headers, contact.niveId, {
                        source: entities.EnumMessagerSource.text,
                        referrer: entities.EnumMessagerReferrer.http,
                        sessionId: result.sid,
                        text: `我通过了您的好友申请，现在我们可以聊天了`,
                        fileId: ''
                    })
                    return connect.commitTransaction().then(async () => {
                        this.logger.info(
                            [SessionService.name, this.httpSessionContactCreater.name].join(':'),
                            divineLogger(headers, { message: '创建私聊会话记录', node: result })
                        )
                        return await divineResolver(result)
                    })
                })
            })
        } catch (e) {
            await connect.rollbackTransaction()
            this.logger.error(
                [SessionService.name, this.httpSessionContactCreater.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        } finally {
            await connect.release()
        }
    }

    /**新建群聊会话**/
    public async httpSessionCommunitCreater(headers: env.Headers, scope: env.BodySessionCommunitCreater) {
        try {
            return await this.customService.divineBuilder(this.customService.tableSession, async qb => {
                qb.where('t.communitId = :communitId AND t.source = :source', {
                    source: 'communit',
                    communitId: scope.communitId
                })
                return qb.getOne().then(async node => {
                    if (node) {
                        /**存在群聊会话记录**/
                        this.logger.info(
                            [SessionService.name, this.httpSessionCommunitCreater.name].join(':'),
                            divineLogger(headers, { message: '存在群聊会话记录', node })
                        )
                        return await divineResolver(node)
                    }
                    /**不存在群聊会话记录、新建一条记录**/ //prettier-ignore
                    return await this.customService.divineCreate(this.customService.tableSession, {
                        headers,
                        state: {
                            source: 'communit',
                            communitId: scope.communitId,
                            sid: await divineIntNumber()
                        }
                    }).then(async result => {
                        this.logger.info(
                            [SessionService.name, this.httpSessionCommunitCreater.name].join(':'),
                            divineLogger(headers, { message: '群聊会话记录创建成功', node: result })
                        )
                        return await divineResolver(result)
                    })
                })
            })
        } catch (e) {
            this.logger.error(
                [SessionService.name, this.httpSessionCommunitCreater.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
