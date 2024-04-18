import { NestFactory } from '@nestjs/core'
import { Transport, MicroserviceOptions } from '@nestjs/microservices'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { WebSocketModule } from '@web-socket/web-socket.module'
import { WebSocketAdapter } from '@web-socket/web-socket.adapter'
import { CustomService } from '@/services/custom.service'

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(WebSocketModule, {
        transport: Transport.REDIS,
        options: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD
        }
    })
    const adapter = new WebSocketAdapter(app, app.get(WINSTON_MODULE_PROVIDER), app.get(CustomService))
    app.useWebSocketAdapter(adapter)
    await app.listen()
}
bootstrap()
