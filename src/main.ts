import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from '@/app.module'
import { WebsocketAdapter } from '@/websocket/websocket.adapter'
import * as express from 'express'
import * as cookieParser from 'cookie-parser'

async function useSwagger(app, opt: { authorize: string }) {
    const options = new DocumentBuilder()
        .setTitle(`Chat API服务`)
        .setDescription(`Chat API Documentation`)
        .setVersion(`1.0.0`)
        .addBearerAuth({ type: 'apiKey', in: 'header', name: opt.authorize }, opt.authorize)
        .build()
    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup('api-doc', app, document, {
        customSiteTitle: `Chat 服务API文档`,
        swaggerOptions: {
            defaultModelsExpandDepth: -1,
            defaultModelExpandDepth: 5,
            filter: true,
            docExpansion: 'none'
        }
    })
    return app
}

async function bootstrap() {
    const prot = process.env.APP_PORT ?? 34578
    const prefix = process.env.APP_PREFIX ?? '/api'
    const app = await NestFactory.create(AppModule)
    const adapter = new WebsocketAdapter(app)

    app.useWebSocketAdapter(adapter)
    //允许跨域
    app.enableCors()
    //解析body参数
    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    //接口前缀
    app.setGlobalPrefix(prefix)
    //全局注册验证管道
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    //挂载文档
    await useSwagger(app, { authorize: 'authorization' })
    //监听端口服务
    await app.listen(prot, () => {
        console.log('Chat服务启动:', `http://localhost:${prot + prefix}`, `http://localhost:${prot}/api-doc`)
    })
}
bootstrap()
