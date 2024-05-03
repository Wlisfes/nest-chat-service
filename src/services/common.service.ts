import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { NodemailerService } from '@/services/nodemailer/nodemailer.service'
import { RedisService } from '@/services/redis/redis.service'
import { CustomService } from '@/services/custom.service'
import { divineSelection } from '@/utils/utils-typeorm'
import { divineResolver, divineIntNumber, divineKeyCompose, divineHandler, divineLogger } from '@/utils/utils-common'
import { divineGrapher } from '@/utils/utils-plugin'
import * as web from '@/config/web-instance'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class CommonService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly customService: CustomService,
        private readonly nodemailer: NodemailerService,
        private readonly redisService: RedisService
    ) {}

    /**图形验证码**/
    public async httpCommonGrapher(headers: env.Headers, response: Response) {
        try {
            const { text, data } = await divineGrapher({ width: 120, height: 40 })
            const sid = await divineIntNumber()
            const key = await divineKeyCompose(web.CHAT_CHAHE_GRAPH_COMMON, sid)
            return await this.redisService.setStore(key, text, 3 * 60, headers).then(async () => {
                this.logger.info(
                    [CommonService.name, this.httpCommonGrapher.name].join(':'),
                    divineLogger(headers, { message: '图形验证码发送成功', seconds: 5 * 60, key, text })
                )
                await response.cookie(web.WEB_COMMON_HEADER_CAPHCHA, sid, { httpOnly: true })
                await response.type('svg')
                return await response.send(data)
            })
        } catch (e) {
            this.logger.error(
                [CommonService.name, this.httpCommonGrapher.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**发送邮件验证码**/
    public async httpCommonNodemailerSender(headers: env.Headers, scope: env.BodyCommonNodemailerSender) {
        try {
            /**注册校验**/
            await divineHandler(env.EnumMailSource.register === scope.source, {
                handler: async () => {
                    return await this.customService.divineNoner(this.customService.tableUser, {
                        headers,
                        message: '邮箱已注册',
                        dispatch: {
                            where: { email: scope.email }
                        }
                    })
                }
            })
            /**修改数据校验**/
            await divineHandler([env.EnumMailSource.forget].includes(scope.source), {
                handler: async () => {
                    return await this.customService.divineHaver(this.customService.tableUser, {
                        headers,
                        message: '邮箱未注册',
                        dispatch: {
                            where: { email: scope.email }
                        }
                    })
                }
            })
            const { code, key } = await divineIntNumber({ random: true, bit: 6 }).then(async code => {
                if (scope.source === 'register') {
                    return { code, key: await divineKeyCompose(web.CHAT_CHAHE_MAIL_REGISTER, scope.email) }
                }
            })
            await this.nodemailer.httpCustomizeNodemailer({
                from: `"Chat" <${this.nodemailer.fromName}>`,
                to: scope.email,
                subject: this.nodemailer.Events[scope.source],
                html: await this.nodemailer.httpReadCustomize(scope.source + '.html', { code, ttl: '5' })
            })
            return await this.redisService.setStore(key, code, 5 * 60, headers).then(async () => {
                this.logger.info(
                    [CommonService.name, this.httpCommonNodemailerSender.name].join(':'),
                    divineLogger(headers, { message: '邮件验证码发送成功', seconds: 5 * 60, key, code })
                )
                return await divineResolver({ message: '发送成功' })
            })
        } catch (e) {
            this.logger.error(
                [CommonService.name, this.httpCommonNodemailerSender.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**颜色背景列表**/
    public async httpCommonWallpaper(headers: env.Headers) {
        try {
            return await this.customService.divineBuilder(this.customService.tableWallpaper, async qb => {
                qb.select(divineSelection('t', ['keyId', 'light', 'dark']))
                return qb.getManyAndCount().then(async ([list = [], total = 0]) => {
                    return await divineResolver({ total, list })
                })
            })
        } catch (e) {
            this.logger.error(
                [CommonService.name, this.httpCommonWallpaper.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
