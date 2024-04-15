import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CustomService } from '@/services/custom.service'
import { SessionService } from '@/services/session.service'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineResolver, divineIntNumber, divineLogger, divineHandler } from '@/utils/utils-common'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class CommunitService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly customService: CustomService,
        private readonly sessionService: SessionService
    ) {}

    /**新建社群**/
    public async httpCommunitCreater(headers: env.Headers, userId: string, scope: env.BodyCommunitCreater) {
        const connect = await this.customService.divineConnectTransaction()
        try {
            await this.customService.divineNoner(this.customService.tableCommunit, {
                headers,
                message: '社群名称已存在或被占用',
                dispatch: { where: { name: scope.name } }
            })
            /**插入社群记录**/
            const communit = await this.customService.divineCreate(this.customService.tableCommunit, {
                headers,
                state: {
                    uid: await divineIntNumber(),
                    name: scope.name,
                    poster: scope.poster,
                    comment: scope.comment,
                    ownId: userId
                }
            })
            /**插入群成员记录**/
            await this.customService.divineCreate(this.customService.tableCommunitMember, {
                headers,
                state: {
                    communitId: communit.uid,
                    userId: userId,
                    role: entities.EnumCommunitMemberRole.master
                }
            })
            /**新建群聊会话**/
            await this.sessionService.httpSessionCommunitCreater(headers, {
                communitId: communit.uid
            })
            return await connect.commitTransaction().then(async () => {
                this.logger.info(
                    [CommunitService.name, this.httpCommunitCreater.name].join(':'),
                    divineLogger(headers, { message: '新建社群成功', communit })
                )
                return await divineResolver({ message: '新建成功' })
            })
        } catch (e) {
            await connect.rollbackTransaction()
            this.logger.error(
                [CommunitService.name, this.httpCommunitCreater.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        } finally {
            await connect.release()
        }
    }

    /**申请加入社群**/
    public async httpCommunitJoiner(
        headers: env.Headers,
        uid: string,
        scope: env.BodyCommunitJoiner
    ) {
        // try {
            // return await this.custom.divineWithTransaction(async manager => {
                // const communit = await this.custom.divineHaver(this.custom.tableCommunit, {
                //     headers,
                //     message: '社群不存在',
                //     dispatch: {
                //         where: { uid: scope.uid },
                //         relations: ['creator', 'members'],
                //         select: {
                //             keyId: true,
                //             uid: true,
                //             name: true,
                //             creator: { keyId: true, uid: true, nickname: true },
                //             members: { keyId: true, uid: true, nickname: true }
                //         }
                //     }
                // })
                //prettier-ignore
                // const user = await this.custom.divineHaver(this.custom.tableUser, {
                //     headers,
                //     message: '账号不存在',
                //     dispatch: { where: { uid } }
                // }).then(async data => {
                //     await divineCatchWherer(communit.members.some(item => item.uid === data.uid), {
                //         message: '您已经是本群成员，无法再次申请加入'
                //     })
                //     /**加入社群**/
                //     await communit.members.push(data)
                //     return await divineResolver(data)
                // })
                // return await manager.save(communit).then(async () => {
                // this.logger.info(
                //     [CommunitService.name, this.httpCommunitCreater.name].join(':'),
                //     divineLogger(headers, { message: '申请加入社群成功', name: communit.name, uid: communit.uid, user })
                // )
                // return await divineResolver({ message: '申请成功' })
                // })
        //     })
        // } catch (e) {
        //     this.logger.error(
        //         [CommunitService.name, this.httpCommunitCreater.name].join(':'),
        //         divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
        //     )
        //     throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        // }
    }

    /**邀请加入社群**/
    public async httpCommunitInviteJoiner(
        headers: env.Headers,
        uid: string,
        scope: env.BodyCommunitInviteJoiner
    ) {
        // try {
            // return await this.custom.divineWithTransaction(async manager => {
                //prettier-ignore
                // const communit = await this.custom.divineHaver(this.custom.tableCommunit, {
                //     headers,
                //     message: '社群不存在',
                //     dispatch: {
                //         where: { uid: scope.uid },
                //         relations: ['creator', 'members'],
                //         select: {
                //             keyId: true,
                //             uid: true,
                //             name: true,
                //             creator: { keyId: true, uid: true, nickname: true },
                //             members: { keyId: true, uid: true, nickname: true }
                //         }
                //     }
                // }).then(async data => {
                //     await divineCatchWherer(data.creator.uid !== uid, {
                //         message: '只有群主才能邀请新成员加入本群'
                //     })
                //     await divineCatchWherer(data.members.some(item => scope.invite.includes(item.uid)), {
                //         message: '群成员无法再次加入社群',
                //         cause: data.members.filter(item => scope.invite.includes(item.uid)).map(item => item.uid)
                //     })
                //     return await divineResolver(data)
                // })
                //prettier-ignore
                // const users = await this.custom.divineBuilder(this.custom.tableUser, async qb => {
                //     qb.where('t.uid IN (:...invite)', { invite: scope.invite })
                //     const list = await qb.getMany()
                //     await divineHandler(list.length !== scope.invite.length, async () => {
                //         return await divineCatchWherer(true, {
                //             message: '账号不存在',
                //             cause: list.filter(item => !scope.invite.includes(item.uid)).map(item => item.uid)
                //         })
                //     })
                //     return await divineResolver(list)
                // })
                /**加入社群**/
                // await communit.members.push(...users)
                // return await manager.save(communit).then(async () => {
                //     this.logger.info(
                //         [CommunitService.name, this.httpCommunitCreater.name].join(':'),
                //         divineLogger(headers, { message: '邀请加入社群成功', name: communit.name, uid: communit.uid, users: users })
                //     )
                // return await divineResolver({ message: '邀请成功' })
                // })
        //     })
        // } catch (e) {
        //     this.logger.error(
        //         [CommunitService.name, this.httpCommunitCreater.name].join(':'),
        //         divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
        //     )
        //     throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        // }
    }

    /**社群列表**/
    public async httpCommunitColumn(headers: env.Headers, uid: string) {
        // try {
        //     return await this.custom.divineBuilder(this.custom.tableCommunit, async qb => {
        //         qb.leftJoinAndSelect('t.creator', 'creator')
        //         qb.innerJoin('t.members', 'members', 'members.uid = :uid', { uid })
        //         return qb.getMany()
        //     })
        // } catch (e) {
        //     this.logger.error(
        //         [CommunitService.name, this.httpCommunitCreater.name].join(':'),
        //         divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
        //     )
        //     throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        // }
    }
}
