import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { ConsumeMessage } from 'amqplib'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CustomService } from '@/services/custom.service'
import { RabbitmqService } from '@/services/rabbitmq.service'
import { divineLogger, divineResolver } from '@/utils/utils-common'
import { divineCustomizeHeaders } from '@/utils/utils-plugin'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class WebChangeMessagerService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly customService: CustomService,
        private readonly rabbitmqService: RabbitmqService
    ) {}

    /**消息已读用户添加**/
    private async httpReadChangeMessager(headers: env.Headers, scope: env.Omix<env.SocketChangeMessager>) {
        try {
            const node = await this.customService.divineNoner(this.customService.tableMessagerRead, {
                headers,
                state: { sid: scope.sid, userId: scope.userId }
            })
            if (node) {
                /**存在已读、直接返回**/
                return await divineResolver(node)
            } else {
                /**否则新增已读数据**/
                return await this.customService.divineCreate(this.customService.tableMessagerRead, {
                    headers,
                    state: { sid: scope.sid, userId: scope.userId }
                })
            }
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
    public async SubscribeChangeMessager(data: env.Omix<env.SocketChangeMessager>, consume: ConsumeMessage) {
        const headers = await divineCustomizeHeaders(consume)
        try {
            this.logger.info(
                [WebChangeMessagerService.name, this.SubscribeChangeMessager.name].join(':'),
                divineLogger(headers, { message: '消息状态变更消费者-开始消费', data })
            )
            /**更新消息状态**/
            await this.httpReadChangeMessager(headers, data)
            /**socket消息变更推送**/
            await this.rabbitmqService.despatchSocketChangeMessager(headers, {
                sid: data.sid,
                userId: data.userId,
                sessionId: data.sessionId
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
