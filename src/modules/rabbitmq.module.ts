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
                    exchanges: [
                        { name: 'web-customize-messager', type: 'topic' },
                        { name: 'web-socket-change-messager', type: 'topic' }
                    ],
                    uri: config.get('RABBITMQ_URL'),
                    connectionInitOptions: { wait: false },
                    prefetchCount: 10,
                    queueOptions: {
                        durable: true
                    },
                    default: {
                        prefetchCount: 10,
                        options: { durable: true }
                    }
                }
            }
        })
    ],
    providers: [RabbitmqService],
    controllers: [],
    exports: [RabbitmqService]
})
export class RabbitmqModule {}
