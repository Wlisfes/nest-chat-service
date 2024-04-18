import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { ConsumeMessage } from 'amqplib'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CustomService } from '@/services/custom.service'
import { RabbitmqService } from '@/services/rabbitmq.service'
import { divineLogger } from '@/utils/utils-common'
import { divineCustomizeHeaders } from '@/utils/utils-plugin'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class WebCustomizeMessagerService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly customService: CustomService,
        private readonly rabbitmqService: RabbitmqService
    ) {}

    /**更新自定义消息状态**/
    private async httpUpdateCustomizeMessager(headers: env.Headers, scope: env.Omix<entities.MessagerEntier>) {
        try {
            return await this.customService.divineUpdate(this.customService.tableMessager, {
                headers,
                where: { sid: scope.sid },
                state: { status: entities.EnumMessagerStatus.delivered }
            })
        } catch (e) {
            this.logger.error(
                [WebCustomizeMessagerService.name, this.httpUpdateCustomizeMessager.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**自定义消息消费者**/
    @RabbitSubscribe({
        exchange: 'web-customize-messager',
        routingKey: 'sub-customize-messager',
        queue: 'sub-customize-messager'
    })
    public async SubscribeCustomizeTransmitter(data: env.Omix<entities.MessagerEntier>, consume: ConsumeMessage) {
        const headers = await divineCustomizeHeaders(consume)
        try {
            this.logger.info(
                [WebCustomizeMessagerService.name, this.SubscribeCustomizeTransmitter.name].join(':'),
                divineLogger(headers, { message: '自定义消息消费者-开始消费', data })
            )
            await this.httpUpdateCustomizeMessager(headers, data)
            await this.rabbitmqService.despatchSocketMessager(headers, data)
            this.logger.info(
                [WebCustomizeMessagerService.name, this.SubscribeCustomizeTransmitter.name].join(':'),
                divineLogger(headers, { message: '自定义消息消费者-消费完成', data })
            )
        } catch (e) {
            this.logger.error(
                [WebCustomizeMessagerService.name, this.SubscribeCustomizeTransmitter.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
        }
    }
}
