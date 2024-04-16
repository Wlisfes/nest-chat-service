import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CustomService } from '@/services/custom.service'
import { RabbitmqService } from '@/services/rabbitmq.service'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineSelection } from '@/utils/utils-typeorm'
import { divineResolver, divineIntNumber, divineLogger, divineHandler } from '@/utils/utils-common'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class MessagerService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly customService: CustomService,
        private readonly rabbitmqService: RabbitmqService
    ) {}

    /**发送自定义消息**/
    public async httpCustomizeMessager(headers: env.Headers) {
        try {
            await this.rabbitmqService.despatchCustomizeTransmitter(headers, {
                sid: await divineIntNumber(),
                content: `山不在高，有仙则名。水不在深，有龙则灵。斯是陋室，惟吾德馨。`
            })
            return await divineResolver({ message: '发送成功' })
        } catch (e) {
            this.logger.error(
                [MessagerService.name, this.httpCustomizeMessager.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
