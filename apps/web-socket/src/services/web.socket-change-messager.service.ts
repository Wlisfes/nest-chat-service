import { Inject, Injectable, HttpStatus } from '@nestjs/common'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { ConsumeMessage } from 'amqplib'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { WebSocketService } from '@web-socket/services/web-socket.service'
import { divineDelay, divineLogger } from '@/utils/utils-common'
import { divineCustomizeHeaders } from '@/utils/utils-plugin'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class WebSocketChangeMessagerService {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger, private readonly webSocketService: WebSocketService) {}

    /**socket消息状态推送消费者**/
    @RabbitSubscribe({
        exchange: 'web-socket-messager',
        routingKey: 'sub-socket-change-messager',
        queue: 'sub-socket-change-messager'
    })
    public async SubscribeSocketChangeMessager(data: env.Omix<env.SocketChangeMessager>, consume: ConsumeMessage) {
        const headers = await divineCustomizeHeaders(consume)
        try {
            this.logger.info(
                [WebSocketChangeMessagerService.name, this.SubscribeSocketChangeMessager.name].join(':'),
                divineLogger(headers, { message: 'socket消息状态推送-开始消费', data })
            )
            /**Socket推送消息状态变更**/
            await this.webSocketService.httpSocketPushChangeMessager(headers, data)
            this.logger.info(
                [WebSocketChangeMessagerService.name, this.SubscribeSocketChangeMessager.name].join(':'),
                divineLogger(headers, { message: 'socket消息状态推送-消费完成', data })
            )
        } catch (e) {
            this.logger.error(
                [WebSocketChangeMessagerService.name, this.SubscribeSocketChangeMessager.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
        }
    }
}
