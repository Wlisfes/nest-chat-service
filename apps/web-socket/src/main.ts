import { NestFactory } from '@nestjs/core'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { ConfigService } from '@nestjs/config'
import { WebSocketModule } from '@web-socket/web-socket.module'
import { WebSocketAdapter } from '@web-socket/web-socket.adapter'
import { CustomService } from '@/services/custom.service'
import * as web from '@/config/instance.config'
import * as express from 'express'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
    const app = await NestFactory.create(WebSocketModule)
    const adapter = new WebSocketAdapter(app, app.get(WINSTON_MODULE_PROVIDER), app.get(ConfigService), app.get(CustomService))
    await adapter.createRedisConnect()
    app.useWebSocketAdapter(adapter)
    //允许跨域
    app.enableCors()
    //解析body参数
    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    await app.listen(web.WEB_SOCKET_PORT, () => {
        console.log('[web-socket]服务启动:', `http://localhost:${web.WEB_SOCKET_PORT}`)
    })
}
bootstrap()
