import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { ConsumeMessage } from 'amqplib'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CustomService } from '@/services/custom.service'
import { RabbitmqService } from '@/services/rabbitmq.service'
import { divineDelay, divineLogger, divineIntNumber } from '@/utils/utils-common'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class WebConsumerService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly customService: CustomService,
        private readonly rabbitmqService: RabbitmqService
    ) {}

    /**获取自定义请求头**/
    private async divineCustomizeHeaders(consume: ConsumeMessage) {
        if (consume.properties.messageId) {
            return {
                [web.WEB_COMMON_HEADER_STARTTIME]: Date.now(),
                [web.WEB_COMMON_HEADER_CONTEXTID]: consume.properties.messageId
            } as never as env.Headers
        }
        return {
            [web.WEB_COMMON_HEADER_STARTTIME]: Date.now(),
            [web.WEB_COMMON_HEADER_CONTEXTID]: await divineIntNumber({ random: true, bit: 32 })
        } as never as env.Headers
    }

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
                [WebConsumerService.name, this.httpUpdateCustomizeMessager.name].join(':'),
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
        const headers = await this.divineCustomizeHeaders(consume)
        try {
            this.logger.info(
                [WebConsumerService.name, this.SubscribeCustomizeTransmitter.name].join(':'),
                divineLogger(headers, { message: '自定义消息消费者-开始消费', data })
            )
            await this.httpUpdateCustomizeMessager(headers, data)
            await divineDelay(2000)
            this.logger.info(
                [WebConsumerService.name, this.SubscribeCustomizeTransmitter.name].join(':'),
                divineLogger(headers, { message: '自定义消息消费者-消费完成', data })
            )
        } catch (e) {
            this.logger.error(
                [WebConsumerService.name, this.SubscribeCustomizeTransmitter.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
        }
    }
}
