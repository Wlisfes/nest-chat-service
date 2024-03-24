import { Injectable, Inject } from '@nestjs/common'
import { CLIENT_TRANSPORT, ClientTransport } from '@/services/nodemailer/nodemailer.provider'
import { divineIntNumber } from '@/utils/utils-common'

@Injectable()
export class NodemailerService {
    constructor(@Inject(CLIENT_TRANSPORT) private readonly client: ClientTransport) {}
}
