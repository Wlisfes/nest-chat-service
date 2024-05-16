import { NestFactory } from '@nestjs/core'
import { Transport, MicroserviceOptions } from '@nestjs/microservices'
import { WebSocketModule } from '@web-socket/web-socket.module'
import { WebSocketAdapter } from '@web-socket/web-socket.adapter'

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(WebSocketModule, {
        transport: Transport.REDIS,
        options: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD
        }
    })
    const adapter = new WebSocketAdapter(app)
    await adapter.createRedisConnect()
    app.useWebSocketAdapter(adapter)
    await app.listen()
}
bootstrap()
