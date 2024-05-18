import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { WebPeerModule } from '@web-peer/web-peer.module'
import { WebPeerService } from '@web-peer/web-peer.service'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(WebPeerModule)
    //启动peer服务
    await app.get(WebPeerService).divineConnectServer(app)
    //监听端口服务
    await app.listen(34550).then(() => {
        console.log('[web-peer]中继服务启动:', `http://localhost:34550`)
    })
}
bootstrap()
