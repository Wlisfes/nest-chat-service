import { Injectable } from '@nestjs/common'
import { LoggerService, Logger } from '@/services/logger.service'
import { CustomService } from '@/services/custom.service'
import { divineSelection } from '@/utils/utils-typeorm'
import { divineResolver } from '@/utils/utils-common'
import * as entities from '@/entities/instance'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class WebSocketDataBaseService extends LoggerService {
    constructor(private readonly customService: CustomService) {
        super()
    }

    /**获取当前用户所有会话房间**/
    @Logger
    public async fetchSocketColumnSession(headers: env.Headers, userId: string) {
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
    }

    /**通知详情**/
    @Logger
    public async fetchNotificationResolver(headers: env.Headers, notifyId: string) {
        return await this.customService.divineBuilder(this.customService.tableNotification, async qb => {
            /**好友申请记录联查**/
            qb.leftJoinAndMapOne('t.user', entities.UserEntier, 'user', 'user.uid = t.userId')
            qb.leftJoinAndMapOne('t.nive', entities.UserEntier, 'nive', 'nive.uid = t.niveId')
            /**社群申请记录联查**/
            qb.leftJoinAndMapOne('t.communit', entities.CommunitEntier, 'communit', 'communit.uid = t.communitId')
            qb.leftJoinAndMapOne('communit.own', entities.UserEntier, 'own', 'communit.ownId = own.uid')
            qb.leftJoinAndMapOne('communit.poster', entities.MediaEntier, 'poster', 'communit.poster = poster.fileId')
            qb.select([
                ...divineSelection('t', ['keyId', 'uid', 'createTime', 'updateTime', 'source']),
                ...divineSelection('t', ['userId', 'niveId', 'json', 'communitId', 'status', 'command']),
                ...divineSelection('user', ['uid', 'nickname', 'avatar', 'status', 'comment']),
                ...divineSelection('nive', ['uid', 'nickname', 'avatar', 'status', 'comment']),
                ...divineSelection('communit', ['keyId', 'uid', 'name', 'poster', 'ownId', 'status', 'comment']),
                ...divineSelection('own', ['uid', 'nickname', 'avatar', 'status', 'comment']),
                ...divineSelection('poster', ['width', 'height', 'fileId', 'fileURL'])
            ])
            qb.where(`t.uid = :uid`, { uid: notifyId })
            return await qb.getOne()
        })
    }

    /**获取消息详情**/
    @Logger
    public async fetchMessagerResolver(headers: env.Headers, scope: { sid: string }) {
        return await this.customService.divineBuilder(this.customService.tableMessager, async qb => {
            /**用户信息联查**/
            qb.leftJoinAndMapOne('t.user', entities.UserEntier, 'user', 'user.uid = t.userId')
            /**媒体文件联查**/
            qb.leftJoinAndMapMany('t.medias', entities.MessagerMediaEntier, 'medias', 'medias.sid = t.sid')
            qb.leftJoinAndMapOne('medias.media', entities.MediaEntier, 'media', 'media.fileId = medias.fileId')
            /**已读用户联查**/
            qb.leftJoinAndMapMany('t.reads', entities.MessagerReadEntier, 'reads', 'reads.sid = :sid', { sid: scope.sid })
            qb.select([
                /**消息基础字段**/
                ...divineSelection('t', ['keyId', 'sid', 'createTime', 'updateTime', 'sessionId', 'userId']),
                ...divineSelection('t', ['contactId', 'communitId', 'text', 'source', 'status', 'reason', 'referrer']),
                /**用户信息字段**/
                ...divineSelection('user', ['uid', 'avatar', 'nickname', 'status']),
                /**媒体文件字段**/
                ...divineSelection('medias', ['keyId', 'sid', 'fileId']),
                ...divineSelection('media', ['keyId', 'source', 'fileName', 'fileSize', 'fileURL', 'width', 'height', 'depater']),
                /**已读用户字段**/
                ...divineSelection('reads', ['keyId', 'sid', 'userId'])
            ])
            qb.where('t.sid = :sid', { sid: scope.sid })
            return qb.getOne().then(async (node: env.Omix) => {
                return await divineResolver({
                    ...node,
                    medias: (node?.medias ?? []).map((media: env.Omix) => {
                        return { sid: media.sid, fileId: media.fileId, ...media.media }
                    })
                })
            })
        })
    }
}
