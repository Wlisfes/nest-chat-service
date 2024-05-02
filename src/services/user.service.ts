import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { compareSync } from 'bcryptjs'
import { isEmpty } from 'class-validator'
import { CustomService } from '@/services/custom.service'
import { RedisService } from '@/services/redis/redis.service'
import { divineMD5Generate } from '@/utils/utils-plugin'
import { divineSelection } from '@/utils/utils-typeorm'
import { divineResolver, divineIntNumber, divineKeyCompose, divineLogger, divineBstract, divineHandler } from '@/utils/utils-common'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class UserService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly customService: CustomService,
        private readonly redisService: RedisService
    ) {}

    /**token生成、登录时间存储**/
    private async fetchJwtTokenSecret(
        headers: env.Headers,
        data: entities.UserEntier,
        scope: env.Omix<{ lasttimeKey: string; device: string }>
    ) {
        const expire = 24 * 60 * 60
        const schema = { uid: data.uid, status: data.status, email: data.email, password: data.password }
        const token = await this.customService.divineJwtTokenSecretr(schema, { message: '身份验证失败', expire })
        /**存储登录日志**/
        const { logId, ua, ip, browser, platform } = divineBstract(headers)
        await this.customService.divineCreate(this.customService.tableLogger, {
            headers,
            state: { source: entities.EnumLoggerSource.login, userId: data.uid, logId, ua, ip, browser, platform }
        })
        /**存储登录设备**/

        /**存储登录时间**/
        return await this.redisService.setStore(scope.lasttimeKey, Date.now(), 0, headers).then(async () => {
            this.logger.info(
                [UserService.name, this.fetchJwtTokenSecret.name].join(':'),
                divineLogger(headers, { message: '登录成功', user: Object.assign(data, { token, expire }) })
            )
            return await divineResolver({ message: '登录成功', factor: false, token, expire })
        })
    }

    /**注册账号**/
    public async httpUserRegister(headers: env.Headers, scope: env.BodyUserRegister) {
        try {
            /**校验邮箱验证码 start**********************/
            const key = await divineKeyCompose(web.CHAT_CHAHE_MAIL_REGISTER, scope.email)
            await this.redisService.getStore(key, null, headers).then(async code => {
                return await this.customService.divineCatchWherer(scope.code !== code, null, {
                    message: '验证码不存在'
                })
            })
            /**校验邮箱验证码 end**********************/
            await this.customService.divineNoner(this.customService.tableUser, {
                headers,
                message: '邮箱已注册',
                dispatch: {
                    where: { email: scope.email }
                }
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
                        avatar: `https://chat-oss.lisfes.cn/chat/avatar/2161418838745382965.webp`,
                        comment: `你好，我正在使用Chat盒子`
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
            /**校验图形验证码 start**********************/
            const sid = request.cookies[web.WEB_COMMON_HEADER_CAPHCHA]
            await divineHandler(Boolean(sid), {
                failure: () => this.customService.divineCatchWherer(true, null, { message: '验证码不存在' }),
                handler: async () => {
                    const key = await divineKeyCompose(web.CHAT_CHAHE_GRAPH_COMMON, sid)
                    return await this.redisService.getStore<string>(key, null, headers).then(async code => {
                        const compared = isEmpty(code) || scope.code.toUpperCase() !== code.toUpperCase()
                        await this.redisService.delStore(key, headers)
                        return await this.customService.divineCatchWherer(compared, null, {
                            message: '验证码不存在'
                        })
                    })
                }
            })
            /**校验图形验证码 end**********************/
            return await this.customService.divineBuilder(this.customService.tableUser, async qb => {
                this.logger.info(
                    [UserService.name, this.httpUserAuthorizer.name].join(':'),
                    divineLogger(headers, { message: `[${this.customService.tableUser.metadata.name}]:查询入参`, dispatch: scope })
                )
                qb.addSelect('t.password')
                qb.where('t.email = :email', { email: scope.email })
                return qb.getOne().then(async data => {
                    this.logger.info(
                        [UserService.name, this.httpUserAuthorizer.name].join(':'),
                        divineLogger(headers, { message: `[${this.customService.tableUser.metadata.name}]:查询出参`, node: data })
                    )
                    /**验证登录邮箱**/
                    await this.customService.divineCatchWherer(!Boolean(data), null, {
                        message: '账号不存在',
                        status: HttpStatus.BAD_REQUEST
                    })
                    /**验证账号密码**/
                    await this.customService.divineCatchWherer(!compareSync(scope.password, data.password), null, {
                        message: '账号密码错误',
                        status: HttpStatus.BAD_REQUEST
                    })
                    /**验证账号登录状态**/
                    await this.customService.divineCatchWherer(data.status === 'disable', null, {
                        message: '账号已被禁用',
                        status: HttpStatus.FORBIDDEN
                    })

                    //最后登录时间
                    const lasttimeKey = await divineKeyCompose(web.CHAT_CHAHE_USER_LASTTIME, data.uid)
                    const lastTime = await this.redisService.getStore<number>(lasttimeKey, 0, headers)
                    //双因子登录间隔时间
                    const limitKey = await divineKeyCompose(web.CHAT_CHAHE_USER_LIMIT, data.uid)
                    const limit = await this.redisService.getStore<number>(limitKey, 7, headers)
                    const effect = limit * (24 * 60 * 60 * 1000)
                    //登录设备编码
                    const newDevice = await divineMD5Generate(request.useragent.source)
                    const deviceKey = await divineKeyCompose(web.CHAT_CHAHE_USER_LASTTIME, data.uid, newDevice)
                    const device = await this.redisService.getStore<string>(deviceKey, null, headers)
                    if (!data.factor || lastTime === 0) {
                        /**未开启双因子认证、可直接返回前端登录**/
                        /**redis中没有最后登录时间: 可直接返回登录**/
                        return await this.fetchJwtTokenSecret(headers, data, { lasttimeKey, device })
                    } else if (Boolean(device) && lastTime + effect > Date.now()) {
                        /**不是新的登录源并且最后登录时间未超出15天: 可直接返回登录**/
                        return await this.fetchJwtTokenSecret(headers, data, { lasttimeKey, device })
                    } else {
                        return await divineResolver({ message: '需双因子认证', factor: true })
                    }
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
                        ...divineSelection('t', ['email', 'comment', 'theme', 'paint', 'sound', 'notify', 'factor', 'limit']),
                        ...divineSelection('color', ['keyId', 'light', 'dark'])
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
                        theme: scope.theme ?? data.theme,
                        color: scope.color ?? data.color.keyId,
                        paint: scope.paint ?? data.paint,
                        sound: scope.sound ?? data.sound,
                        notify: scope.notify ?? data.notify,
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
