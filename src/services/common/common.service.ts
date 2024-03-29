import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { NodemailerService } from '@/services/nodemailer/nodemailer.service'
import { RedisService } from '@/services/redis/redis.service'
import { divineResolver, divineIntNumber } from '@/utils/utils-common'
import { WEB_MAIL_CACHE } from '@/config/web-redis.config'
import * as env from '@/interface/instance'

@Injectable()
export class CommonService {
    constructor(private readonly nodemailer: NodemailerService, private readonly redis: RedisService) {}

    /**发送邮件验证码**/
    public async httpCommonNodemailerSender(scope: env.BodyCommonNodemailerSender) {
        try {
            const code = await divineIntNumber({ random: true, bit: 6 })
            await this.nodemailer.httpCustomizeNodemailer({
                from: `"Chat" <${this.nodemailer.fromName}>`,
                to: scope.email,
                subject: this.nodemailer.Events[scope.source],
                html: await this.nodemailer.httpReadCustomize(scope.source + '.html', { code, ttl: '5' })
            })
            return await this.redis.setStore(WEB_MAIL_CACHE[scope.source] + ':' + scope.email, code, 5 * 60).then(async () => {
                return await divineResolver({ message: '发送成功' })
            })
        } catch (e) {
            throw new HttpException(e.message, e.code ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
