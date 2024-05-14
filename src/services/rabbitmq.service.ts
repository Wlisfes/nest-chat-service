import { Injectable } from '@nestjs/common'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { LoggerService, Logger } from '@/services/logger.service'
import * as web from '@/config/web-instance'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class RabbitmqService extends LoggerService {
    constructor(private readonly amqpConnection: AmqpConnection) {
        super()
    }

    /**发送自定义消息**/
    @Logger
    public async despatchCustomizeTransmitter<T>(headers: env.Headers, data: env.Omix<T>) {
        this.logger.info({ message: '发送自定义消息', data })
        return await this.amqpConnection.publish('web-customize-messager', 'sub-customize-messager', data, {
            timestamp: Date.now(),
            messageId: headers[web.WEB_COMMON_HEADER_CONTEXTID]
        })
    }

    /**socket消息状态推送**/
    @Logger
    public async despatchSocketChangeMessager<T>(headers: env.Headers, data: env.Omix<T>) {
        this.logger.info({ message: 'socket消息状态推送', data })
        return await this.amqpConnection.publish('web-socket-change-messager', 'sub-socket-change-messager', data, {
            timestamp: Date.now(),
            messageId: headers[web.WEB_COMMON_HEADER_CONTEXTID]
        })
    }
}
