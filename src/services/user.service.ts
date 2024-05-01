import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { compareSync } from 'bcryptjs'
import { isEmpty } from 'class-validator'
import { CustomService } from '@/services/custom.service'
import { UploaderService } from '@/services/uploader/uploader.service'
import { CommonService } from '@/services/common.service'
import { RedisService } from '@/services/redis/redis.service'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineSelection } from '@/utils/utils-typeorm'
import { divineResolver, divineIntNumber, divineKeyCompose, divineLogger, divineHandler } from '@/utils/utils-common'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class UserService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly customService: CustomService,
        private readonly uploader: UploaderService,
        private readonly commonService: CommonService,
        private readonly redisService: RedisService
    ) {}

    /**注册账号**/
    public async httpUserRegister(headers: env.Headers, scope: env.BodyUserRegister) {
        try {
            const key = await divineKeyCompose(web.CHAT_CHAHE_MAIL_REGISTER, scope.email)
            await this.redisService.getStore(key, null, headers).then(async code => {
                return await divineCatchWherer(scope.code !== code, {
                    message: '验证码不存在'
                })
            })
            await this.customService.divineNoner(this.customService.tableUser, {
                headers,
                message: '邮箱已注册',
                dispatch: {
                    where: { email: scope.email }
                }
            })
            /**拉取远程随机头像**/ //prettier-ignore
            const { url } = await this.uploader.httpStreamRemoter(
                headers,
                `https://api.uomg.com/api/rand.avatar?sort=女&format=images`
            ).then(async ({buffer, name, size}) => {
                return await this.uploader.putStream(headers, {
                    buffer,
                    name,
                    size,
                    source: entities.MediaEntierSource.image
                })
            })
            return await this.customService.divineWithTransaction(async manager => {
                const user = await this.customService.divineCreate(this.customService.tableUser, {
                    manager: true,
                    headers,
                    state: {
                        uid: await divineIntNumber(),
                        email: scope.email,
                        nickname: scope.nickname,
                        password: scope.password,
                        avatar: url
                    }
                })
                await manager.save(user)
                return await this.redisService.delStore(key, headers).then(async () => {
                    this.logger.info(
                        [UserService.name, this.httpUserRegister.name].join(':'),
                        divineLogger(headers, { message: '注册成功', user })
                    )
                    return await divineResolver({ message: '注册成功' })
                })
            })
        } catch (e) {
            this.logger.error(
                [UserService.name, this.httpUserRegister.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**登录账号**/
    public async httpUserAuthorizer(headers: env.Headers, request: env.Omix, scope: env.BodyUserAuthorizer) {
        try {
            const sid = request.cookies[web.WEB_COMMON_HEADER_CAPHCHA]
            const key = await divineKeyCompose(web.CHAT_CHAHE_GRAPH_COMMON, sid)
            await this.redisService.getStore<string>(key, null, headers).then(async code => {
                await divineHandler(Boolean(sid), {
                    handler: async () => {
                        return await this.redisService.delStore(key, headers)
                    }
                })
                return await divineCatchWherer(isEmpty(code) || scope.code.toUpperCase() !== code.toUpperCase(), {
                    message: '验证码不存在'
                })
            })
            //prettier-ignore
            const node = await this.customService.divineHaver(this.customService.tableUser, {
                headers,
                message: '账号不存在',
                dispatch: {
                    where: { email: scope.email },
                    select: { uid: true, email: true, status: true, password: true }
                }
            }).then(async ({ uid, status, email, password }) => {
                await divineCatchWherer(!compareSync(scope.password, password), {
                    message: '账号密码错误',
                    status: HttpStatus.BAD_REQUEST
                })
                await divineCatchWherer(status === 'disable', {
                    message: '账号已被禁用',
                    status: HttpStatus.FORBIDDEN
                })
                return await divineResolver({ uid, status, email, password })
            })
            //prettier-ignore
            return await this.customService.divineJwtTokenSecretr(node, {
                message: '身份验证失败',
                expire: 24 * 60 * 60
            }).then(async token => {
                this.logger.info(
                    [UserService.name, this.httpUserAuthorizer.name].join(':'),
                    divineLogger(headers, {
                        message: '登录成功',
                        user: Object.assign(node, { token, expire: 24 * 60 * 60 })
                    })
                )
                return await divineResolver({ message: '登录成功', token, expire: 24 * 60 * 60 })
            })
        } catch (e) {
            this.logger.error(
                [UserService.name, this.httpUserAuthorizer.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**账号信息**/
    public async httpUserResolver(headers: env.Headers, userId: string, refresh?: boolean) {
        try {
            const key = await divineKeyCompose(web.CHAT_CHAHE_USER_RESOLVER, userId)
            return await this.redisService.getStore(key, null, headers).then(async node => {
                if (node && !refresh) {
                    return await divineResolver(node)
                }
                return await this.customService.divineBuilder(this.customService.tableUser, async qb => {
                    qb.leftJoinAndMapOne('t.color', entities.WallpaperEntier, 'color', 't.color = color.keyId')
                    qb.select([
                        ...divineSelection('t', ['keyId', 'createTime', 'updateTime', 'uid', 'status', 'nickname', 'avatar']),
                        ...divineSelection('t', ['email', 'comment', 'theme', 'paint', 'sound', 'notify']),
                        ...divineSelection('color', ['light', 'dark'])
                    ])
                    qb.where('t.uid = :uid', { uid: userId })
                    return qb.getOne().then(async data => {
                        this.logger.info(
                            [UserService.name, this.httpUserResolver.name].join(':'),
                            divineLogger(headers, { message: `[${this.customService.tableUser.metadata.name}]:查询出参`, node: data })
                        )
                        await this.customService.divineCatchWherer(!Boolean(data), data, {
                            headers,
                            message: '身份验证失败'
                        })
                        return await this.redisService.setStore(key, data, 0, headers).then(async () => {
                            return await divineResolver(data)
                        })
                    })
                })
            })
        } catch (e) {
            this.logger.error(
                [UserService.name, this.httpUserAuthorizer.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**用户基础信息更新**/
    public async httpUserUpdate(headers: env.Headers, userId: string, scope: env.BodyUserUpdate) {
        try {
            const media = await divineHandler<entities.MediaEntier>(Boolean(scope.fileId), {
                handler: async () => {
                    return await this.customService.divineHaver(this.customService.tableMedia, {
                        message: '媒体ID不存在或类型错误',
                        headers,
                        dispatch: {
                            where: { userId, fileId: scope.fileId, source: entities.MediaEntierSource.image }
                        }
                    })
                }
            })
            const key = await divineKeyCompose(web.CHAT_CHAHE_USER_RESOLVER, userId)
            return await this.redisService.getStore(key, null, headers).then(async data => {
                await this.customService.divineCatchWherer(!Boolean(data), data, {
                    message: '身份验证失败'
                })
                /**更新用户基础信息**/
                await this.customService.divineUpdate(this.customService.tableUser, {
                    headers,
                    where: { uid: userId },
                    state: {
                        nickname: scope.nickname ?? data.nickname,
                        comment: scope.comment ?? data.comment,
                        avatar: media?.fileURL ?? data.avatar
                    }
                })
                /**刷新redis缓存**/
                return await this.httpUserResolver(headers, userId, true).then(async () => {
                    return divineResolver({ message: '更新成功' })
                })
            })
        } catch (e) {
            this.logger.error(
                [UserService.name, this.httpUserUpdate.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
