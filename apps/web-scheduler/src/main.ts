import { NestFactory } from '@nestjs/core'
import { WebSchedulerModule } from '@web-scheduler/web-scheduler.module'
import { moment } from '@/utils/utils-common'

async function bootstrap() {
    const app = await NestFactory.create(WebSchedulerModule)
    await app.listen(34572).then(() => {
        console.log(new Date(moment().format('YYYY/MM/DD')).getTime())
        console.log('[web-scheduler]消费者服务启动:', `http://localhost:34572`)
    })
}
bootstrap()
