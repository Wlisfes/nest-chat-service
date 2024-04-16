import { Inject, Injectable, HttpStatus } from '@nestjs/common'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { ConsumeMessage } from 'amqplib'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CustomService } from '@/services/custom.service'
import { divineDelay, divineLogger, divineIntNumber } from '@/utils/utils-common'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class WebConsumerService {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger, private readonly customService: CustomService) {}

    /**获取自定义请求头**/
    private async divineCustomizeHeaders(consume: ConsumeMessage) {
        return {
            [web.WEB_COMMON_HEADER_STARTTIME]: Date.now(),
            [web.WEB_COMMON_HEADER_CONTEXTID]: consume.properties.messageId || (await divineIntNumber({ random: true, bit: 32 }))
        } as never as env.Headers
    }

    /**自定义消息消费者**/
    @RabbitSubscribe({
        exchange: 'web-customize-transmitter',
        routingKey: 'sub-customize-transmitter',
        queue: 'sub-customize-transmitter'
    })
    public async SubscribeCustomizeTransmitter(data: env.Omix, consume: ConsumeMessage) {
        const headers = await this.divineCustomizeHeaders(consume)
        try {
            this.logger.info(
                [WebConsumerService.name, this.SubscribeCustomizeTransmitter.name].join(':'),
                divineLogger(headers, { message: '自定义消息消费者-开始消费', data })
            )
            await divineDelay(1000)
            this.logger.info(
                [WebConsumerService.name, this.SubscribeCustomizeTransmitter.name].join(':'),
                divineLogger(headers, { message: '自定义消息消费者-消费结束', data })
            )
        } catch (e) {
            this.logger.error(
                [WebConsumerService.name, this.SubscribeCustomizeTransmitter.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
        }
    }
}
