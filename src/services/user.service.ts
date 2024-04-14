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
import { request, divineResolver, divineIntNumber, divineLogger, divineHandler } from '@/utils/utils-common'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class UserService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly custom: CustomService,
        private readonly uploader: UploaderService,
        private readonly common: CommonService,
        private readonly redis: RedisService
    ) {}

    /**注册账号**/
    public async httpUserRegister(headers: env.Headers, scope: env.BodyUserRegister) {
        try {
            await this.redis.getStore(`${web.WEB_REDIS_MAIL_CACHE.register}:${scope.email}`).then(async code => {
                return await divineCatchWherer(scope.code !== code, {
                    message: '验证码不存在'
                })
            })
            await this.custom.divineNoner(this.custom.tableUser, {
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
                    folder: env.EnumUploadFolder.avatar
                })
            })
            return await this.custom.divineWithTransaction(async manager => {
                const user = await this.custom.divineCreate(this.custom.tableUser, {
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
                return await this.redis.delStore(`${web.WEB_REDIS_MAIL_CACHE.register}:${scope.email}`).then(async () => {
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
            const key = `${web.WEB_REDIS_GRAPH_CACHE.common}:${sid ?? ''}`
            await this.redis.getStore<string>(key).then(async code => {
                await divineHandler(Boolean(sid), async () => {
                    return await this.redis.delStore(key)
                })
                return await divineCatchWherer(isEmpty(code) || scope.code.toUpperCase() !== code.toUpperCase(), {
                    message: '验证码不存在'
                })
            })
            //prettier-ignore
            const node = await this.custom.divineHaver(this.custom.tableUser, {
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
            return await this.custom.divineJwtTokenSecretr(node, {
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
    public async httpUserResolver(headers: env.Headers, uid: string) {
        try {
            const key = `${web.WEB_REDIS_USER_CACHE.resolver}:${uid}`
            return await this.redis.getStore(key, null, headers).then(async node => {
                if (node) {
                    return await divineResolver(node)
                }
                //prettier-ignore
                return await this.custom.divineHaver(this.custom.tableUser, { 
                    headers,
                    message: '身份验证失败',
                    dispatch: { where: { uid } }
                }).then(async data => {
                    await this.redis.setStore(key, data, 24 * 60 * 60)
                    this.logger.info(
                        [UserService.name, this.httpUserResolver.name].join(':'),
                        divineLogger(headers, { message: '账号信息读取成功', user: data })
                    )
                    return await divineResolver(data)
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
}
