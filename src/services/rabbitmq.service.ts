import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { divineLogger } from '@/utils/utils-common'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class RabbitmqService {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger, private readonly amqpConnection: AmqpConnection) {}

    /**发送自定义消息**/
    public async despatchCustomizeTransmitter<T>(headers: env.Headers, data: env.Omix<T>) {
        try {
            this.logger.info(
                [RabbitmqService.name, this.despatchCustomizeTransmitter.name].join(':'),
                divineLogger(headers, { message: '发送自定义消息', data })
            )
            return await this.amqpConnection.publish('web-customize-messager', 'sub-customize-messager', data, {
                timestamp: Date.now(),
                messageId: headers[web.WEB_COMMON_HEADER_CONTEXTID]
            })
        } catch (e) {
            this.logger.error(
                [RabbitmqService.name, this.despatchCustomizeTransmitter.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
