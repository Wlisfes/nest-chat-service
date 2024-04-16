import { Inject, Injectable } from '@nestjs/common'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { ConsumeMessage } from 'amqplib'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CustomService } from '@/services/custom.service'
import { divineDelay } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class WebConsumerService {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger, private readonly customService: CustomService) {}

    /**自定义消息消费者**/
    @RabbitSubscribe({
        exchange: 'web-customize-transmitter',
        routingKey: 'sub-customize-transmitter',
        queue: 'sub-customize-transmitter'
    })
    public async SubscribeCustomizeTransmitter(data: env.Omix, consume: ConsumeMessage) {
        try {
            await divineDelay(1000)
            console.log('SubscribeCustomizeTransmitter:', data)
        } catch (e) {}
    }
}
