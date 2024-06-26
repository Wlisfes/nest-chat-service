import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { ConsumeMessage } from 'amqplib'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CustomService } from '@/services/custom.service'
import { divineLogger, divineResolver } from '@/utils/utils-common'
import { divineCustomizeHeaders } from '@/utils/utils-plugin'
import { divineClientSender } from '@/utils/utils-microservices'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class WebCustomizeMessagerService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        @Inject('WEB-SOCKET') private socketClient: ClientProxy,
        private readonly customService: CustomService
    ) {}

    /**更新自定义消息状态**/
    private async httpUpdateCustomizeMessager(headers: env.Headers, scope: env.Omix<entities.MessagerEntier>) {
        try {
            await this.customService.divineUpdate(this.customService.tableMessager, {
                headers,
                where: { sid: scope.sid },
                state: { status: entities.EnumMessagerStatus.delivered }
            })
            return await divineResolver({ ...scope, status: entities.EnumMessagerStatus.delivered })
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
            /**更新消息状态**/
            await this.httpUpdateCustomizeMessager(headers, data)
            /**调用socket服务方法、Socket推送消息至客户端**/
            await divineClientSender(this.socketClient, {
                eventName: 'web-socket-push-messager',
                headers: headers,
                state: {
                    sid: data.sid,
                    referrer: data.referrer,
                    userId: data.userId,
                    sessionId: data.sessionId
                }
            })
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
