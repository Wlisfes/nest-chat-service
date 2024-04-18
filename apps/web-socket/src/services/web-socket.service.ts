import { Injectable, Inject } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { MessagerService } from '@/services/messager.service'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class WebSocketService {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger, private readonly messagerService: MessagerService) {}

    /**Socket发送自定义消息**/
    public async httpSocketCustomizeMessager(headers: env.Headers, userId: string, scope: env.BodyCheckCustomizeMessager) {
        return await this.messagerService.httpCommonCustomizeMessager(headers, userId, {
            ...scope,
            referrer: entities.EnumMessagerReferrer.socket
        })
    }
}
