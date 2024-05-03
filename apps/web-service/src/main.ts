import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from '@web-service/app.module'
import * as web from '@/config/instance.config'
import * as express from 'express'
import * as cookieParser from 'cookie-parser'

async function useSwagger(app) {
    const options = new DocumentBuilder()
        .setTitle('Chat API服务')
        .setDescription('Chat API Documentation')
        .setVersion('1.0.0')
        .addBearerAuth({ type: 'apiKey', in: 'header', name: web.WEB_COMMON_HEADER_AUTHORIZE }, web.WEB_COMMON_HEADER_AUTHORIZE)
        .build()
    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup('api-doc', app, document, {
        customSiteTitle: 'Chat 服务API文档',
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
    const app = await NestFactory.create(AppModule)

    //允许跨域
    app.enableCors()
    //解析body参数
    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    //接口前缀
    app.setGlobalPrefix(`/web-service`)
    //全局注册验证管道
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    //挂载文档
    await useSwagger(app)
    //监听端口服务
    await app.listen(34570, () => {
        console.log('[web-service]服务启动:', `http://localhost:34570/web-service`, `http://localhost:34570/api-doc`)
    })
}
bootstrap()
