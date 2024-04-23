import { NestFactory } from '@nestjs/core'
import { WebAlterModule } from '@web-alter/web-alter.module'
import { moment } from '@/utils/utils-common'

async function bootstrap() {
    const app = await NestFactory.create(WebAlterModule)
    await app.listen(34573).then(() => {
        console.log(new Date(moment().format('YYYY/MM/DD')).getTime())
        console.log('[web-alter]消费者服务启动:', `http://localhost:34573`)
    })
}
bootstrap()
