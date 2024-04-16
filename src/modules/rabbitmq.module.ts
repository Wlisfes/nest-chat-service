import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { RabbitmqService } from '@/services/rabbitmq.service'

@Global()
@Module({
    imports: [
        RabbitMQModule.forRootAsync(RabbitMQModule, {
            inject: [ConfigService],
            useFactory(config: ConfigService) {
                return {
                    exchanges: [{ name: 'web-scheduler', type: 'topic' }],
                    uri: config.get('RABBITMQ_URL'),
                    connectionInitOptions: { wait: false }
                }
            }
        })
    ],
    providers: [RabbitmqService],
    controllers: [],
    exports: [RabbitmqService]
})
export class RabbitmqModule {}
