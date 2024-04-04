import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CustomService } from '@/services/custom.service'
import { RedisService } from '@/services/redis/redis.service'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineResolver, divineIntNumber, divineLogger, divineHandler } from '@/utils/utils-common'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class CommunitService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly custom: CustomService,
        private readonly redis: RedisService
    ) {}

    /**新建社群**/
    public async httpCommunitCreater(headers: env.Headers, uid: string, scope: env.BodyCommunitCreater) {
        try {
            return await this.custom.divineWithTransaction(async manager => {
                await this.custom.divineNoner(this.custom.tableCommunit, {
                    headers,
                    message: '社群名称已存在或被占用',
                    dispatch: {
                        where: { name: scope.name }
                    }
                })
                const user = await this.custom.divineHaver(this.custom.tableUser, {
                    headers,
                    message: '账号不存在',
                    dispatch: { where: { uid } }
                })
                const communit = await this.custom.divineCreate(this.custom.tableCommunit, {
                    headers,
                    manager: true,
                    state: {
                        uid: await divineIntNumber(),
                        name: scope.name,
                        creator: user,
                        members: [user]
                    }
                })
                return await manager.save(communit).then(async () => {
                    this.logger.info(
                        [CommunitService.name, this.httpCommunitCreater.name].join(':'),
                        divineLogger(headers, { message: '新建社群成功', name: scope.name, creator: user })
                    )
                    return await divineResolver({ message: '新建成功' })
                })
            })
        } catch (e) {
            this.logger.error(
                [CommunitService.name, this.httpCommunitCreater.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**申请加入社群**/
    public async httpCommunitJoiner(headers: env.Headers, uid: string, scope: env.BodyCommunitJoiner) {
        try {
            return await this.custom.divineWithTransaction(async manager => {
                const communit = await this.custom.divineHaver(this.custom.tableCommunit, {
                    headers,
                    message: '社群不存在',
                    dispatch: {
                        where: { uid: scope.uid },
                        relations: ['members']
                    }
                })
                //prettier-ignore
                const user = await this.custom.divineHaver(this.custom.tableUser, {
                    headers,
                    message: '账号不存在',
                    dispatch: { where: { uid } }
                }).then(async data => {
                    await divineCatchWherer(communit.members.some(item => item.uid === data.uid), {
                        message: '社群成员不能再次申请'
                    })
                    /**加入社群**/
                    await communit.members.push(data)
                    return await divineResolver(data)
                })
                return await manager.save(communit).then(async () => {
                    this.logger.info(
                        [CommunitService.name, this.httpCommunitCreater.name].join(':'),
                        divineLogger(headers, { message: '申请加入社群成功', name: communit.name, uid: communit.uid, user })
                    )
                    return await divineResolver({ message: '申请成功' })
                })
            })
        } catch (e) {
            this.logger.error(
                [CommunitService.name, this.httpCommunitCreater.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**邀请加入社群**/
    public async httpCommunitInviteJoiner(headers: env.Headers, uid: string, scope: env.BodyCommunitInviteJoiner) {
        try {
            //prettier-ignore
            const communit = await this.custom.divineHaver(this.custom.tableCommunit, {
                headers,
                message: '社群不存在',
                dispatch: {
                    where: { uid: scope.uid },
                    relations: ['members']
                }
            }).then(async data => {
                await divineCatchWherer(data.members.some(item => scope.invite.includes(item.uid)), {
                    message: '社群成员不能再次申请',
                    cause: data.members.filter(item => scope.invite.includes(item.uid)).map(item => item.uid)
                })
                return await divineResolver(data)
            })

            const users = await this.custom.divineBuilder(this.custom.tableUser, async qb => {
                qb.where('t.uid IN (:...invite)', { invite: scope.invite })
                const [list = [], total = 0] = await qb.getManyAndCount()
                if (total < scope.invite.length) {
                    const count = list
                        .filter(item => !scope.invite.includes(item.uid))
                        .map(item => {
                            return {}
                        })
                }
                console.log(total, list)

                return list
            })

            return await divineResolver({ message: '邀请成功' })
        } catch (e) {
            this.logger.error(
                [CommunitService.name, this.httpCommunitCreater.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**社群列表**/
    public async httpCommunitColumn(headers: env.Headers, uid: string) {
        try {
            return await this.custom.divineBuilder(this.custom.tableCommunit, async qb => {
                qb.leftJoinAndSelect('t.creator', 'creator')
                qb.innerJoin('t.members', 'members', 'members.uid = :uid', { uid })
                return qb.getMany()
            })
        } catch (e) {
            this.logger.error(
                [CommunitService.name, this.httpCommunitCreater.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
