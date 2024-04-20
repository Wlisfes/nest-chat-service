import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { isEmpty } from 'class-validator'
import { CustomService } from '@/services/custom.service'
import { RabbitmqService } from '@/services/rabbitmq.service'
import { divineSelection } from '@/utils/utils-typeorm'
import { divineResolver, divineIntNumber, divineLogger } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class MessagerService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly customService: CustomService,
        private readonly rabbitmqService: RabbitmqService
    ) {}

    /**自定义消息前置参数校验**/
    public async httpCheckCustomizeMessager(headers: env.Headers, userId: string, scope: env.BodyCheckCustomizeMessager) {
        try {
            if (scope.source === entities.EnumMessagerSource.text) {
                /**文本消息**/
                await this.customService.divineCatchWherer(isEmpty(scope.text), null, {
                    message: '文本消息不能为空'
                })
            } else {
                /**媒体消息**/
                await this.customService.divineCatchWherer(isEmpty(scope.fileId), null, {
                    message: '媒体ID不能为空'
                })
            }
            /**验证会话ID、好友、社群绑定关系**/
            return await this.httpCheckSessionBinder(userId, scope.sessionId)
        } catch (e) {
            this.logger.error(
                [MessagerService.name, this.httpCheckCustomizeMessager.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**验证当前用户与sessionId会话是否存在绑定关系**/
    public async httpCheckSessionBinder(userId: string, sessionId: string) {
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
            qb.where(`t.sid = :sid AND (member.userId = :userId OR (contact.userId = :userId OR contact.niveId = :userId))`, {
                sid: sessionId,
                userId: userId
            })
            return qb.getOne().then(async node => {
                await this.customService.divineCatchWherer(isEmpty(node), null, {
                    message: '会话SID不存在'
                })
                if (node.source === entities.EnumSessionSource.contact) {
                    /**私聊会话**/
                    const contact = (node as any).contact as entities.ContactEntier
                    await this.customService.divineCatchWherer(contact.status === entities.EnumContactStatus.delete, null, {
                        message: '好友已删除'
                    })
                } else {
                    /**群聊会话**/
                    const communit = (node as any).communit as entities.CommunitEntier
                    await this.customService.divineCatchWherer(communit.status === entities.EnumCommunitStatus.dissolve, null, {
                        message: '社群已解散'
                    })
                }
                return await divineResolver(node)
            })
        })
    }

    /**验证消息文件ID数据**/
    public async httpCheckMediaMessager(headers: env.Headers, userId: string, scope: env.BodyCheckMediaMessager) {
        try {
            const node = await this.customService.divineHaver(this.customService.tableMedia, {
                headers,
                message: '媒体ID不存在',
                dispatch: {
                    where: { fileId: scope.fileId, userId }
                }
            })
            await this.customService.divineCatchWherer(node.source !== scope.source, null, {
                message: '媒体类型错误'
            })
            return await divineResolver(node)
        } catch (e) {
            this.logger.error(
                [MessagerService.name, this.httpCheckMediaMessager.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**写入自定义消息记录**/
    public async httpCreateCustomizeMessager(headers: env.Headers, scope: env.Omix<Partial<entities.MessagerEntier>>) {
        try {
            /**写入已读记录**/
            await this.customService.divineCreate(this.customService.tableMessagerRead, {
                headers,
                state: { sid: scope.sid, userId: scope.userId }
            })
            return await this.customService.divineCreate(this.customService.tableMessager, {
                headers,
                state: scope
            })
        } catch (e) {
            await this.customService.divineUpdate(this.customService.tableMessager, {
                headers,
                where: { sid: scope.sid },
                state: {
                    reason: e.message,
                    status: entities.EnumMessagerStatus.failed
                }
            })
            this.logger.error(
                [MessagerService.name, this.httpCreateCustomizeMessager.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**发送自定义消息通用方法**/
    public async httpCommonCustomizeMessager(headers: env.Headers, userId: string, scope: env.BodyCommonCustomizeMessager) {
        try {
            /**验证会话ID、好友、社群绑定关系**/
            const data = await this.httpCheckCustomizeMessager(headers, userId, scope)
            const message = {
                sid: await divineIntNumber(), //消息SID
                sessionId: scope.sessionId, //会话SID
                userId: userId, //消息发送用户UID
                contactId: data.contactId, //好友绑定关系ID
                communitId: data.communitId, //社群ID
                text: scope.text, //文本内容
                source: scope.source, //消息类型
                status: entities.EnumMessagerStatus.sending, //消息状态
                reason: null, //消息失败原因
                referrer: scope.referrer //消息来源
            }
            if (scope.source === entities.EnumMessagerSource.text) {
                /**文本消息**/
                await this.httpCreateCustomizeMessager(headers, message).catch(e => {
                    message.status = entities.EnumMessagerStatus.failed
                    message.reason = e.message
                })
            } else {
                /**媒体消息文件验证**/
                await this.httpCheckMediaMessager(headers, userId, {
                    source: scope.source,
                    fileId: scope.fileId
                })
                /**写入媒体记录关联**/
                await this.customService.divineCreate(this.customService.tableMessageMediar, {
                    headers,
                    state: { sid: message.sid, fileId: scope.fileId }
                })
                /**写入记录**/
                await this.httpCreateCustomizeMessager(headers, message).catch(e => {
                    message.status = entities.EnumMessagerStatus.failed
                    message.reason = e.message
                })
            }
            /**写入MQ队列**/
            return await this.rabbitmqService.despatchCustomizeTransmitter(headers, message).then(async () => {
                return await divineResolver({ message: '提交成功', sid: message.sid })
            })
        } catch (e) {
            this.logger.error(
                [MessagerService.name, this.httpCommonCustomizeMessager.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**获取消息详情**/
    public async httpSessionOneMessager(headers: env.Headers, scope: env.QuerySessionOneMessager) {
        try {
            return await this.customService.divineBuilder(this.customService.tableMessager, async qb => {
                /**媒体文件联查**/
                qb.leftJoinAndMapMany('t.medias', entities.MessagerMediaEntier, 'medias', 'medias.sid = t.sid')
                qb.leftJoinAndMapOne('medias.media', entities.MediaEntier, 'media', 'media.fileId = medias.fileId')
                qb.leftJoinAndMapOne('media.depater', entities.MediaEntier, 'depater', 'depater.fileId = media.depater')
                /**已读用户联查**/
                qb.leftJoinAndMapMany('t.reads', entities.MessagerReadEntier, 'reads', 'reads.sid = t.sid')
                qb.select([
                    /**消息基础字段**/
                    ...divineSelection('t', ['keyId', 'sid', 'createTime', 'updateTime', 'sessionId', 'userId']),
                    ...divineSelection('t', ['contactId', 'communitId', 'text', 'source', 'status', 'reason', 'referrer']),
                    /**媒体文件字段**/
                    ...divineSelection('medias', ['sid', 'fileId']),
                    ...divineSelection('media', ['source', 'fileName', 'fileSize', 'fileURL', 'width', 'height']),
                    ...divineSelection('depater', ['fileName', 'fileSize', 'fileURL', 'width', 'height']),
                    /**已读用户字段**/
                    ...divineSelection('reads', ['sid', 'userId'])
                ])
                qb.where('t.sid = :sid', { sid: scope.sid })
                return qb.getOne().then(async (node: env.Omix) => {
                    return await divineResolver({
                        ...node,
                        medias: (node.medias ?? []).map((media: env.Omix) => {
                            return { sid: media.sid, fileId: media.fileId, ...media.media }
                        })
                    })
                })
            })
        } catch (e) {
            this.logger.error(
                [MessagerService.name, this.httpSessionOneMessager.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**会话消息列表**/
    public async httpSessionColumnMessager(headers: env.Headers, userId: string, scope: env.QuerySessionColumnMessager) {
        try {
            /**验证会话ID、好友、社群绑定关系**/
            await this.httpCheckSessionBinder(userId, scope.sessionId)
            /**查询消息记录列表**/
            return await this.customService.divineBuilder(this.customService.tableMessager, async qb => {
                /**用户信息联查**/
                qb.leftJoinAndMapOne('t.user', entities.UserEntier, 'user', 'user.uid = t.userId')
                /**媒体文件联查**/
                qb.leftJoinAndMapMany('t.medias', entities.MessagerMediaEntier, 'medias', 'medias.sid = t.sid')
                qb.leftJoinAndMapOne('medias.media', entities.MediaEntier, 'media', 'media.fileId = medias.fileId')
                qb.leftJoinAndMapOne('media.depater', entities.MediaEntier, 'depater', 'depater.fileId = media.depater')
                /**已读用户联查**/
                qb.leftJoinAndMapMany('t.reads', entities.MessagerReadEntier, 'reads', 'reads.sid = t.sid')
                qb.select([
                    /**消息基础字段**/
                    ...divineSelection('t', ['keyId', 'sid', 'createTime', 'updateTime', 'sessionId', 'userId']),
                    ...divineSelection('t', ['contactId', 'communitId', 'text', 'source', 'status', 'reason', 'referrer']),
                    /**用户信息字段**/
                    ...divineSelection('user', ['uid', 'avatar', 'nickname', 'status']),
                    /**媒体文件字段**/
                    ...divineSelection('medias', ['sid', 'fileId']),
                    ...divineSelection('media', ['source', 'fileName', 'fileSize', 'fileURL', 'width', 'height']),
                    ...divineSelection('depater', ['fileName', 'fileSize', 'fileURL', 'width', 'height']),
                    /**已读用户字段**/
                    ...divineSelection('reads', ['sid', 'userId'])
                ])
                qb.where(`t.sessionId = :sessionId`, { sessionId: scope.sessionId })
                qb.orderBy('t.createTime', 'DESC')
                qb.skip(scope.offset)
                qb.take(scope.limit)
                return qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                    return await divineResolver({
                        total,
                        list: list.map((item: env.Omix) => ({
                            ...item,
                            medias: (item.medias ?? []).map((media: env.Omix) => {
                                return { sid: media.sid, fileId: media.fileId, ...media.media }
                            })
                        }))
                    })
                })
            })
        } catch (e) {
            this.logger.error(
                [MessagerService.name, this.httpSessionColumnMessager.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
