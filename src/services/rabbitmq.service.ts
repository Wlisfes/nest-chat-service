import { Injectable } from '@nestjs/common'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'

@Injectable()
export class RabbitmqService {
    constructor(private readonly amqpConnection: AmqpConnection) {}

    async sendMethod() {
        const message = { key: 'value111' }
        await this.amqpConnection.publish('web-scheduler', 'route-scheduler', message)
        return {}
    }
}
