import { Injectable } from '@nestjs/common'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'

@Injectable()
export class WebConsumerService {
    @RabbitSubscribe({
        exchange: 'web-scheduler',
        routingKey: 'route-scheduler',
        queue: 'route-scheduler'
    })
    public async SubscribeHandler(content: Buffer, msg: {}) {
        // console.log("content", content)
        const message = JSON.parse(content.toString())
        console.log('SubscribeHandler received:', message)
    }
}
