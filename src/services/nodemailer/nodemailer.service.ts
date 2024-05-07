import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CLIENT_TRANSPORT, ClientTransport, readNodemailer, customNodemailer } from '@/services/nodemailer/nodemailer.provider'
import { divineResolver, divineLogger } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class NodemailerService {
    public readonly fromName = `"Chat" <${this.configService.get('SMTP_USER')}>`
    constructor(
        @Inject(CLIENT_TRANSPORT) private readonly client: ClientTransport,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly configService: ConfigService
    ) {}

    /**读取自定义模板**/
    public async httpReadCustomize(source: string, scope: env.Omix = {}) {
        return await readNodemailer(source, scope)
    }

    /**发送邮件**/
    public async httpCustomizeNodemailer(headers: env.Headers, scope: Parameters<typeof customNodemailer>['1']) {
        try {
            return await customNodemailer(this.client, scope).then(async data => {
                this.logger.info(
                    [NodemailerService.name, this.httpCustomizeNodemailer.name].join(':'),
                    divineLogger(headers, { message: '发送邮件成功', data })
                )
                return await divineResolver(data)
            })
        } catch (e) {
            this.logger.error(
                [NodemailerService.name, this.httpCustomizeNodemailer.name].join(':'),
                divineLogger(headers, { message: e.message, cause: e, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException({ message: '发送邮件失败', cause: e }, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
