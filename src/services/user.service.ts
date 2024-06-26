import { Injectable, HttpStatus } from '@nestjs/common'
import { compareSync } from 'bcryptjs'
import { isEmpty, isEmail } from 'class-validator'
import { isMobile } from '@/decorator/common.decorator'
import { LoggerService, Logger } from '@/services/logger.service'
import { CustomService } from '@/services/custom.service'
import { RedisService } from '@/services/redis/redis.service'
import { NodemailerService } from '@/services/nodemailer/nodemailer.service'
import { divineMD5Generate } from '@/utils/utils-plugin'
import { divineSelection } from '@/utils/utils-typeorm'
import { divineResolver, divineIntNumber, divineKeyCompose, divineBstract, divineHandler } from '@/utils/utils-common'
import { faker, divineMaskCharacter, divineParameter } from '@/utils/utils-common'
import * as web from '@/config/web-instance'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class UserService extends LoggerService {
    constructor(
        private readonly customService: CustomService,
        private readonly redisService: RedisService,
        private readonly nodemailer: NodemailerService
    ) {
        super()
    }

    /**用户基础redis配置**/
    private async fetchCommonUserRedis(headers: env.Headers, userId: string) {
        /**最后登录时间**/
        const lasttimeKey = await divineKeyCompose(web.CHAT_CHAHE_USER_LASTTIME, userId)
        const lastTime = await this.redisService.getStore<number>(headers, { key: lasttimeKey, defaultValue: 0 })
        /**登录设备编码**/
        const device = await divineMD5Generate(headers['user-agent'])
        const deviceKey = await divineKeyCompose(web.CHAT_CHAHE_USER_DEVICE, userId, device)
        const deviceStore = await this.redisService.getStore<string>(headers, { key: deviceKey, defaultValue: null })
        /**双因子登录间隔时间**/
        const limitKey = await divineKeyCompose(web.CHAT_CHAHE_USER_LIMIT, userId)
        const limit = await this.redisService.getStore<number>(headers, { key: limitKey, defaultValue: 7 })
        const effect = limit * (24 * 60 * 60 * 1000)
        return { lasttimeKey, lastTime, device, deviceKey, deviceStore, limitKey, limit, effect }
    }

    /**token生成、登录时间存储**/
    @Logger
    private async fetchJwtTokenSecret(
        headers: env.Headers,
        data: entities.UserEntier,
        scope: env.Omix<{ lasttimeKey: string; deviceKey: string }>
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
        await this.redisService.setStore(headers, {
            key: scope.deviceKey,
            data: { logId, ua, ip, browser, platform }
        })
        /**存储登录时间**/
        return await this.redisService.setStore(headers, { key: scope.lasttimeKey, data: Date.now() }).then(async () => {
            this.logger.info({ message: '登录成功', user: Object.assign(data, { token, expire }) })
            return await divineResolver({ message: '登录成功', factor: false, token, expire })
        })
    }

    /**注册账号**/
    @Logger
    public async httpUserRegister(headers: env.Headers, scope: env.BodyUserRegister) {
        const { keyName } = await divineKeyCompose(web.CHAT_CHAHE_MAIL_REGISTER, scope.email).then(async keyName => {
            const code = await this.redisService.getStore(headers, { key: keyName, defaultValue: null })
            await this.customService.divineCatchWherer(scope.code !== code, null, {
                message: '验证码不存在'
            })
            /**邮箱注册校验**/
            await this.customService.divineNoner(this.customService.tableUser, {
                headers,
                message: '邮箱已注册',
                dispatch: { where: { email: scope.email } }
            })
            return await divineResolver({ keyName })
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
                    color: web.WEB_WALLPAPER_WAID[0],
                    avatar: `https://chat-oss.lisfes.cn/chat/image/2161418838745382965.jpeg`,
                    comment: `你好，我正在使用Chat盒子`
                }
            })
            await manager.save(user)
            return await this.redisService.delStore(headers, { key: keyName }).then(async () => {
                this.logger.info({ message: '注册成功', user })
                return await divineResolver({ message: '注册成功' })
            })
        })
    }

    /**发送注册验证码**/
    @Logger
    public async httpUserRegisterSender(headers: env.Headers, scope: env.BodyUserRegisterSender) {
        await this.customService.divineNoner(this.customService.tableUser, {
            headers,
            message: '邮箱已注册',
            dispatch: { where: { email: scope.email } }
        })
        const code = await divineIntNumber({ random: true, bit: 6 })
        const keyName = await divineKeyCompose(web.CHAT_CHAHE_MAIL_REGISTER, scope.email)
        return await this.nodemailer.httpReadCustomize('', { code, ttl: '5', title: '注册账号' }).then(async html => {
            await this.nodemailer.httpCustomizeNodemailer(headers, {
                from: this.nodemailer.fromName,
                subject: 'Chat',
                to: scope.email,
                html
            })
            await this.redisService.setStore(headers, { key: keyName, data: code, seconds: 5 * 60 })
            return await divineResolver({ message: '发送成功' }, () => {
                this.logger.info({ message: '验证码发送成功', seconds: 5 * 60, keyName, code })
            })
        })
    }

    /**登录账号**/
    @Logger
    public async httpUserAuthorizer(headers: env.Headers, request: env.Omix, scope: env.BodyUserAuthorizer) {
        /**校验图形验证码**/
        const sid = request.cookies[web.WEB_COMMON_HEADER_CAPHCHA]
        await divineHandler(Boolean(sid), {
            failure: () => this.customService.divineCatchWherer(true, null, { message: '验证码不存在' }),
            handler: async () => {
                const key = await divineKeyCompose(web.CHAT_CHAHE_GRAPH_COMMON, sid)
                return await this.redisService.getStore<string>(headers, { key, defaultValue: null }).then(async code => {
                    const compared = isEmpty(code) || scope.code.toUpperCase() !== code.toUpperCase()
                    await this.redisService.delStore(headers, { key })
                    return await this.customService.divineCatchWherer(compared, null, {
                        message: '验证码不存在'
                    })
                })
            }
        })
        return await this.customService.divineBuilder(this.customService.tableUser, async qb => {
            this.logger.info({
                message: `[${this.customService.tableUser.metadata.name}]:查询入参`,
                dispatch: scope
            })
            qb.addSelect('t.password')
            qb.where('t.email = :email', { email: scope.email })
            return qb.getOne().then(async data => {
                this.logger.info({
                    message: `[${this.customService.tableUser.metadata.name}]:查询出参`,
                    node: data
                })
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
                const store = await this.fetchCommonUserRedis(headers, data.uid)
                if (!data.factor || store.lastTime === 0) {
                    /**未开启双因子认证、可直接返回前端登录**/
                    /**redis中没有最后登录时间: 可直接返回登录**/
                    return await this.fetchJwtTokenSecret(headers, data, store).then(async node => {
                        await divineHandler(store.lastTime === 0, {
                            handler: () => this.customService.tableUser.update({ uid: data.uid }, { factor: true })
                        })
                        return await divineResolver(node)
                    })
                } else if (store.deviceStore && store.lastTime + store.effect > Date.now()) {
                    /**不是新的登录源并且最后登录时间未超出15天: 可直接返回登录**/
                    return await this.fetchJwtTokenSecret(headers, data, store)
                }
                return await divineResolver({
                    message: '双因子认证',
                    factor: true,
                    uid: data.uid,
                    email: await divineMaskCharacter('email', data.email)
                })
            })
        })
    }

    /**发送双因子认证验证码**/
    @Logger
    public async httpUserfactorSender(headers: env.Headers, scope: env.BodyUserfactorSender) {
        const node = await this.httpUserResolver(headers, scope.uid)
        const code = await divineIntNumber({ random: true, bit: 6 })
        const keyName = await divineKeyCompose(web.CHAT_CHAHE_MAIL_FACTOR, node.email)
        return await this.nodemailer.httpReadCustomize('', { code, ttl: '5', title: '双因子认证' }).then(async html => {
            await this.nodemailer.httpCustomizeNodemailer(headers, {
                from: this.nodemailer.fromName,
                subject: 'Chat',
                to: node.email,
                html
            })
            await this.redisService.setStore(headers, { key: keyName, data: code, seconds: 5 * 60 })
            return await divineResolver({ message: '发送成功' }, () => {
                this.logger.info({ message: '验证码发送成功', seconds: 5 * 60, keyName, code })
            })
        })
    }

    /**双因子认证登录**/
    @Logger
    public async httpUserfactor(headers: env.Headers, scope: env.BodyUserfactor) {
        const data = await this.httpUserResolver(headers, scope.uid)
        const keyCode = await divineKeyCompose(web.CHAT_CHAHE_MAIL_FACTOR, data.email)
        return await this.redisService.getStore(headers, { key: keyCode, defaultValue: null }).then(async code => {
            await this.customService.divineCatchWherer(scope.code !== code, null, {
                message: '验证码不存在'
            })
            const store = await this.fetchCommonUserRedis(headers, data.uid)
            return await this.fetchJwtTokenSecret(headers, data, store).then(async node => {
                await this.redisService.delStore(headers, { key: keyCode })
                return await divineResolver(node)
            })
        })
    }

    /**用户基础信息更新**/
    @Logger
    public async httpUserUpdate(headers: env.Headers, userId: string, scope: env.BodyUserUpdate) {
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
        const keyName = await divineKeyCompose(web.CHAT_CHAHE_USER_RESOLVER, userId)
        return await this.redisService.getStore(headers, { key: keyName, defaultValue: null }).then(async data => {
            await this.customService.divineCatchWherer(!Boolean(data), data, {
                message: '身份验证失败'
            })
            const state = await divineParameter(scope).then(async (params: env.Omix<env.BodyUserUpdate>) => {
                await divineHandler(Boolean(scope.fileId), {
                    handler: () => {
                        delete params.fileId
                        return (params.avatar = media?.fileURL ?? data.avatar)
                    }
                })
                await divineHandler(Boolean(scope.color), {
                    handler: async () => {
                        await this.customService.divineHaver(this.customService.tableWallpaper, {
                            headers,
                            message: 'color ID不存在',
                            dispatch: { where: { waid: scope.color } }
                        })
                        return (params.color = scope.color)
                    }
                })
                return await divineResolver(params)
            })
            /**更新用户基础信息**/
            await this.customService.divineUpdate(this.customService.tableUser, {
                headers,
                where: { uid: userId },
                state: state
            })
            /**刷新redis缓存**/
            return await this.httpUserResolver(headers, userId, true).then(async () => {
                return await divineResolver({ message: '更新成功' })
            })
        })
    }

    /**用户账号信息更新**/
    @Logger
    public async httpUserUpdateResolver(headers: env.Headers, userId: string, scope: env.BodyUserUpdateResolver) {}

    /**账号信息**/
    @Logger
    public async httpUserResolver(headers: env.Headers, userId: string, refresh?: boolean) {
        const keyName = await divineKeyCompose(web.CHAT_CHAHE_USER_RESOLVER, userId)
        return await this.redisService.getStore(headers, { key: keyName, defaultValue: null }).then(async node => {
            if (node && !refresh) {
                return await divineResolver(node)
            }
            return await this.customService.divineBuilder(this.customService.tableUser, async qb => {
                qb.leftJoinAndMapOne('t.color', entities.WallpaperEntier, 'color', 't.color = color.waid')
                qb.select([
                    ...divineSelection('t', ['keyId', 'createTime', 'updateTime', 'uid', 'status', 'nickname', 'avatar']),
                    ...divineSelection('t', ['email', 'comment', 'theme', 'paint', 'sound', 'notify', 'factor', 'limit']),
                    ...divineSelection('color', ['waid', 'light', 'dark'])
                ])
                qb.where('t.uid = :uid', { uid: userId })
                return qb.getOne().then(async data => {
                    this.logger.info({
                        message: `[${this.customService.tableUser.metadata.name}]:查询出参`,
                        node: data
                    })
                    await this.customService.divineCatchWherer(!Boolean(data), data, {
                        headers,
                        message: '身份验证失败'
                    })
                    return await this.redisService.setStore(headers, { key: keyName, data, seconds: 0 }).then(async () => {
                        return await divineResolver(data)
                    })
                })
            })
        })
    }

    /**查看用户信息**/
    @Logger
    public async httpUserCurrentResolver(headers: env.Headers, userId: string, scope: env.BodyUserCurrentResolver) {
        return await this.httpUserResolver(headers, scope.uid).then(async data => {
            return await divineResolver({
                uid: data.uid,
                comment: data.comment,
                nickname: data.nickname,
                avatar: data.avatar,
                email: await divineMaskCharacter('email', data.email)
            })
        })
    }
}
