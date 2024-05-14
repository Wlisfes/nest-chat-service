import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { isEmpty } from 'class-validator'
import { CustomService } from '@/services/custom.service'
import { MessagerService } from '@/services/messager.service'
import { divineSelection } from '@/utils/utils-typeorm'
import { divineResolver, divineIntNumber, divineLogger, divineKeyCompose, divineCaseWherer } from '@/utils/utils-common'
import { divineClientSender } from '@/utils/utils-microservices'
import * as web from '@/config/web-instance'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class SessionService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        @Inject('WEB-SOCKET') private socketClient: ClientProxy,
        private readonly customService: CustomService,
        private readonly messagerService: MessagerService
    ) {}

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
}
