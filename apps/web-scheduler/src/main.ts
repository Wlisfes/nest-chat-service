import { NestFactory } from '@nestjs/core'
import { Transport, MicroserviceOptions } from '@nestjs/microservices'
import { WebSchedulerModule } from '@web-scheduler/web-scheduler.module'

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(WebSchedulerModule, {
        transport: Transport.RMQ,
        options: {
            urls: [''],
            queue: 'web-scheduler',
            queueOptions: {
                durable: false
            }
        }
    })
    //监听端口服务
    await app.listen().then(() => {
        console.log('[web-scheduler]服务启动:')
    })
}
bootstrap()
