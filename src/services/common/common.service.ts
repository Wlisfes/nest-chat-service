import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { NodemailerService } from '@/services/nodemailer/nodemailer.service'
import { RedisService } from '@/services/redis/redis.service'
import { divineResolver, divineIntNumber, divineLogger } from '@/utils/utils-common'
import * as web from '@/config/instance'
import * as env from '@/interface/instance'

@Injectable()
export class CommonService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly nodemailer: NodemailerService,
        private readonly redis: RedisService
    ) {}

    /**发送邮件验证码**/
    public async httpCommonNodemailerSender(scope: env.BodyCommonNodemailerSender, headers: env.Headers) {
        try {
            const code = await divineIntNumber({ random: true, bit: 6 })
            const key = `${web.WEB_REDIS_MAIL_CACHE[scope.source]}:${scope.email}`
            await this.nodemailer.httpCustomizeNodemailer({
                from: `"Chat" <${this.nodemailer.fromName}>`,
                to: scope.email,
                subject: this.nodemailer.Events[scope.source],
                html: await this.nodemailer.httpReadCustomize(scope.source + '.html', { code, ttl: '5' })
            })
            return await this.redis.setStore(key, code, 5 * 60).then(async () => {
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
            throw new HttpException(e.message, e.code ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
