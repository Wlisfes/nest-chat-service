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

@Injectable()
export class WebChangeMessagerService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        @Inject('WEB-SOCKET') private socketClient: ClientProxy,
        private readonly customService: CustomService
    ) {}

    /**消息已读用户存储**/
    private async httpReadChangeMessager(headers: env.Headers, scope: env.Omix<env.BodySocketChangeMessager>) {
        try {
            /**查询是否存在已读数据**/ //prettier-ignore
            return await this.customService.divineNoner(this.customService.tableMessagerRead, {
                headers,
                dispatch: {
                    where: { sid: scope.sid, userId: scope.userId }
                }
            }).then(async (node) => {
                if (Boolean(node)) {
                    /**存在已读、直接返回**/
                    return await divineResolver(node)
                } else {
                    /**否则新增已读数据**/
                    return await this.customService.divineCreate(this.customService.tableMessagerRead, {
                        headers,
                        state: { sid: scope.sid, userId: scope.userId }
                    })
                }
            })
        } catch (e) {
            this.logger.error(
                [WebChangeMessagerService.name, this.httpReadChangeMessager.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**消息状态变更消费者**/
    @RabbitSubscribe({
        exchange: 'web-socket-change-messager',
        routingKey: 'sub-socket-change-messager',
        queue: 'sub-socket-change-messager'
    })
    public async SubscribeChangeMessager(data: env.Omix<env.BodySocketChangeMessager>, consume: ConsumeMessage) {
        const headers = await divineCustomizeHeaders(consume)
        try {
            this.logger.info(
                [WebChangeMessagerService.name, this.SubscribeChangeMessager.name].join(':'),
                divineLogger(headers, { message: '消息状态变更消费者-开始消费', data })
            )
            /**更新消息状态**/
            await this.httpReadChangeMessager(headers, data)
            /**调用socket服务方法、Socket推送消息状态变更至客户端**/
            await divineClientSender(this.socketClient, {
                eventName: 'web-socket-push-change-messager',
                headers: headers,
                state: data
            })
            this.logger.info(
                [WebChangeMessagerService.name, this.SubscribeChangeMessager.name].join(':'),
                divineLogger(headers, { message: '消息状态变更消费者-消费完成', data: data })
            )
        } catch (e) {
            this.logger.error(
                [WebChangeMessagerService.name, this.SubscribeChangeMessager.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
        }
    }
}
