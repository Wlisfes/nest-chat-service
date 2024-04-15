import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CustomService } from '@/services/custom.service'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineSelection } from '@/utils/utils-typeorm'
import { divineResolver, divineIntNumber, divineLogger, divineHandler } from '@/utils/utils-common'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class SessionService {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger, private readonly customService: CustomService) {}

    /**会话列表**/
    public async httpSessionColumn(headers: env.Headers, userId: string) {
        try {
            return await this.customService.divineBuilder(this.customService.tableSession, async qb => {
                qb.innerJoinAndMapOne('t.contact', entities.ContactEntier, 'contact', 'contact.uid = t.contactId')
                qb.leftJoinAndMapOne('contact.user', entities.UserEntier, 'user', 'user.uid = contact.userId')
                qb.leftJoinAndMapOne('contact.nive', entities.UserEntier, 'nive', 'nive.uid = contact.niveId')
                qb.select([
                    ...divineSelection('t', ['keyId', 'sid', 'source', 'contactId', 'communitId']),
                    ...divineSelection('contact', ['keyId', 'uid', 'status', 'userId', 'niveId']),
                    ...divineSelection('user', ['uid', 'nickname', 'avatar', 'status']),
                    ...divineSelection('nive', ['uid', 'nickname', 'avatar', 'status'])
                ])
                qb.where('contact.userId = :userId OR contact.niveId = :userId', { userId })
                return qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                    return await divineResolver({ total, list })
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
        try {
            await this.customService.divineBuilder(this.customService.tableSession, async qb => {
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
                    /**不存在私聊会话记录、新建一条记录**/ //prettier-ignore
                    return await this.customService.divineCreate(this.customService.tableSession, {
                        headers,
                        state: {
                            source: 'contact',
                            contactId: scope.contactId,
                            sid: await divineIntNumber()
                        }
                    }).then(async result => {
                        this.logger.info(
                            [SessionService.name, this.httpSessionContactCreater.name].join(':'),
                            divineLogger(headers, { message: '私聊会话记录创建成功', node: result })
                        )
                        return await divineResolver(result)
                    })
                })
            })
        } catch (e) {
            this.logger.error(
                [SessionService.name, this.httpSessionContactCreater.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**新建群聊会话**/
    public async httpSessionCommunitCreater(headers: env.Headers, scope: env.BodySessionCommunitCreater) {
        try {
            await this.customService.divineBuilder(this.customService.tableSession, async qb => {
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
