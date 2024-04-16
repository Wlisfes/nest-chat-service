import { NestFactory } from '@nestjs/core'
import { WebSchedulerModule } from '@web-scheduler/web-scheduler.module'

async function bootstrap() {
    const app = await NestFactory.create(WebSchedulerModule)
    await app.listen(34572).then(() => {
        console.log('[web-scheduler]服务启动:', `http://localhost:34572`)
    })
}
bootstrap()
