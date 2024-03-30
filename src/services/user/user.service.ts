import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CustomService } from '@/services/common/custom.service'
import { CommonService } from '@/services/common/common.service'
import { DataBaseService } from '@/services/database/database.service'
import { RedisService } from '@/services/redis/redis.service'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineResolver, divineIntNumber, divineLogger } from '@/utils/utils-common'
import * as web from '@/config/instance'
import * as env from '@/interface/instance'

@Injectable()
export class UserService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly dataBase: DataBaseService,
        private readonly custom: CustomService,
        private readonly common: CommonService,
        private readonly redis: RedisService
    ) {}

    /**注册账号**/
    public async httpUserRegister(scope: env.BodyUserRegister, headers: env.Headers) {
        try {
            await this.redis.getStore(`${web.WEB_REDIS_MAIL_CACHE.register}:${scope.email}`).then(async code => {
                return await divineCatchWherer(scope.code !== code, {
                    message: '验证码不存在'
                })
            })
            await this.custom.divineNoner(this.dataBase.tableUser, {
                message: '邮箱已注册',
                where: { email: scope.email }
            })
            return await this.custom.divineWithTransaction(async manager => {
                const user = this.dataBase.tableUser.create({
                    uid: await divineIntNumber(),
                    email: scope.email,
                    nickname: scope.nickname,
                    password: scope.password,
                    avatar: 'https://oss.lisfes.cn/cloud/avatar/2021-08/1628499170684.png'
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

    /**登录账号**/ //prettier-ignore
    public async httpUserAuthorizer(scope: env.BodyUserAuthorizer, headers: env.Headers, request: env.Omix) {
        try {
            const sid = request.cookies[web.WEB_COMMON_HEADER_CAPHCHA]
            const key = `${web.WEB_REDIS_GRAPH_CACHE.common}:${sid ?? ''}`
            await this.redis.getStore(key).then(async code => {
                return await divineCatchWherer(scope.code !== code, {
                    message: '验证码不存在'
                })
            })
            const node = await this.custom.divineHaver(this.dataBase.tableUser, {
                where: { email: scope.email },
                select: { uid: true, email: true, status: true, password: true }
            }).then(async ({ uid, status, email, password }) => {
                await divineCatchWherer(status === 'disable', {
                    message: '账号已被禁用',
                    status: HttpStatus.FORBIDDEN
                })
                return await divineResolver({ uid, status, email, password })
            })
            return await this.custom.divineJwtTokenSecretr(node, { expire: 24 * 60 * 60 }).then(async token => {
                await this.redis.delStore(key)
                this.logger.info(
                    [UserService.name, this.httpUserAuthorizer.name].join(':'),
                    divineLogger(headers, {
                        message: '登录成功',
                        user: Object.assign(node, { key, token, expire: 24 * 60 * 60 })
                    })
                )
                return await divineResolver({ token, expire: 24 * 60 * 60 })
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
