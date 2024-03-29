import { NestFactory } from '@nestjs/core'
import { WebSocketModule } from '@web-socket/web-socket.module'
import { WebSocketAdapter } from '@web-socket/web-socket.adapter'
import { APP_PORT } from '@/config/web-socket.config'
import * as express from 'express'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
    const app = await NestFactory.create(WebSocketModule)
    const adapter = new WebSocketAdapter(app)
    app.useWebSocketAdapter(adapter)
    //允许跨域
    app.enableCors()
    //解析body参数
    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    await app.listen(APP_PORT, () => {})
}
bootstrap()
