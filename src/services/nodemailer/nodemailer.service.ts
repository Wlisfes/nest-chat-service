import { Injectable, Inject } from '@nestjs/common'
import { CLIENT_TRANSPORT, ClientTransport, readNodemailer, customNodemailer } from '@/services/nodemailer/nodemailer.provider'
import { Omix } from '@/interface/global.resolver'

@Injectable()
export class NodemailerService {
    constructor(@Inject(CLIENT_TRANSPORT) private readonly client: ClientTransport) {}

    /**读取自定义模板**/
    public async httpReadCustomize(source: string, scope: Omix = {}) {
        return await readNodemailer(source, scope)
    }

    /**发送邮件**/
    public async httpCustomizeNodemailer(scope: Parameters<typeof customNodemailer>['1']) {
        return await customNodemailer(this.client, scope)
    }
}
