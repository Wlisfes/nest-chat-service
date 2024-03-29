import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from '@web-service/app.module'
import { APP_HEADER_AUTHORIZE } from '@/config/web-common.config'
import { APP_PORT, APP_SWAGGER } from '@/config/web-service.config'
import * as express from 'express'
import * as cookieParser from 'cookie-parser'

async function useSwagger(app) {
    const options = new DocumentBuilder()
        .setTitle(APP_SWAGGER.titlle)
        .setDescription(APP_SWAGGER.description)
        .setVersion(APP_SWAGGER.version)
        .addBearerAuth({ type: 'apiKey', in: 'header', name: APP_HEADER_AUTHORIZE }, APP_HEADER_AUTHORIZE)
        .build()
    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup('api-doc', app, document, {
        customSiteTitle: APP_SWAGGER.customSiteTitle,
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
    await app.listen(APP_PORT, () => {
        console.log('Chat服务启动:', `http://localhost:${APP_PORT}/web-service`, `http://localhost:${APP_PORT}/api-doc`)
    })
}
bootstrap()
