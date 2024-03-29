import { Injectable, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CLIENT_TRANSPORT, ClientTransport, readNodemailer, customNodemailer } from '@/services/nodemailer/nodemailer.provider'
import { Omix, EnumMailSource } from '@/interface/instance'
export const Events: Omix = {
    [EnumMailSource.register]: 'Chat | 注册账号'
}

@Injectable()
export class NodemailerService {
    public readonly fromName: string = this.configService.get('SMTP_USER')
    public readonly Events: typeof Events = Events
    constructor(@Inject(CLIENT_TRANSPORT) private readonly client: ClientTransport, private readonly configService: ConfigService) {}

    /**读取自定义模板**/
    public async httpReadCustomize(source: string, scope: Omix = {}) {
        return await readNodemailer(source, scope)
    }

    /**发送邮件**/
    public async httpCustomizeNodemailer(scope: Parameters<typeof customNodemailer>['1']) {
        return await customNodemailer(this.client, scope)
    }
}
