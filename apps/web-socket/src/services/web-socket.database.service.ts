import { Injectable } from '@nestjs/common'
import { CustomService } from '@/services/custom.service'
import { divineSelection } from '@/utils/utils-typeorm'
import { divineResolver } from '@/utils/utils-common'
import * as entities from '@/entities/instance'

@Injectable()
export class WebSocketDataBaseService {
    constructor(private readonly customService: CustomService) {}

    /**获取当前用户所有会话房间**/
    public async fetchSocketColumnSession(userId: string) {
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
    public async fetchNotificationResolver(notifyId: string) {
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
}
