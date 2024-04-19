import { Inject, Injectable, HttpStatus } from '@nestjs/common'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { ConsumeMessage } from 'amqplib'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { WebSocketService } from '@web-socket/services/web-socket.service'
import { divineLogger } from '@/utils/utils-common'
import { divineCustomizeHeaders } from '@/utils/utils-plugin'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class WebSocketMessagerService {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger, private readonly webSocketService: WebSocketService) {}

    /**socket消息推送消费者**/
    @RabbitSubscribe({
        exchange: 'web-socket-messager',
        routingKey: 'sub-socket-messager',
        queue: 'sub-socket-messager'
    })
    public async SubscribeSocketMessager(data: env.Omix<entities.SchemaMessagerEntier>, consume: ConsumeMessage) {
        const headers = await divineCustomizeHeaders(consume)
        try {
            this.logger.info(
                [WebSocketMessagerService.name, this.SubscribeSocketMessager.name].join(':'),
                divineLogger(headers, { message: 'socket消息推送-开始消费', data })
            )
            /**Socket推送自定义消息**/
            await this.webSocketService.httpSocketPushCustomizeMessager(headers, data)
            this.logger.info(
                [WebSocketMessagerService.name, this.SubscribeSocketMessager.name].join(':'),
                divineLogger(headers, { message: 'socket消息推送-消费完成', data })
            )
        } catch (e) {
            this.logger.error(
                [WebSocketMessagerService.name, this.SubscribeSocketMessager.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
        }
    }
}
