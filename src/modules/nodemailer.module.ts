import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NodemailerService } from '@/services/nodemailer/nodemailer.service'
import { CLIENT_TRANSPORT, createNodemailer } from '@/services/nodemailer/nodemailer.provider'

@Global()
@Module({
    imports: [],
    controllers: [],
    providers: [
        {
            provide: CLIENT_TRANSPORT,
            inject: [ConfigService],
            async useFactory(config: ConfigService) {
                return await createNodemailer({
                    host: config.get('SMTP_HOST'),
                    port: config.get('SMTP_PORT'),
                    secure: config.get('SMTP_SECURE'),
                    user: config.get('SMTP_USER'),
                    password: config.get('SMTP_PASSWORD')
                })
            }
        },
        NodemailerService
    ],
    exports: [NodemailerService]
})
export class NodemailerModule {}
