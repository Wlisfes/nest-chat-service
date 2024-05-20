import { Inject, Injectable } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ExpressPeerServer, IClient } from 'peer'
import { LoggerService } from '@/services/logger.service'
import { CustomService } from '@/services/custom.service'
import { RedisService } from '@/services/redis/redis.service'
import { WebPeerClientService } from '@web-peer/web-peer.client.service'
import { divineHandler, divineIntNumber } from '@/utils/utils-common'
import * as web from '@/config/web-instance'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@Injectable()
export class WebPeerService extends LoggerService {
    private server: ReturnType<typeof ExpressPeerServer>
    constructor(
        private readonly customService: CustomService,
        private readonly redisService: RedisService,
        private readonly webPeerClientService: WebPeerClientService
    ) {
        super()
    }

    /**token验证**/
    private async fetchClientJwtAuthorize(client: env.Omix<IClient>): Promise<env.AuthClient> {
        const user = await this.customService.divineJwtTokenParser(client.getToken(), {
            message: '身份验证失败'
        })
        return await divineHandler(!Boolean(client.headers), {
            failure: () => (client.user = user),
            handler: async function () {
                client.user = user
                client.headers = {
                    [web.WEB_COMMON_HEADER_STARTTIME]: Date.now(),
                    [web.WEB_COMMON_HEADER_CONTEXTID]: await divineIntNumber({ random: true, bit: 32 })
                }
            }
        }).then(() => client as env.AuthClient)
    }

    /**连接成功事件**/
    public async fetchServerConnection(event: env.Omix<IClient>) {
        // console.log(event)
        // this.logger.info([], { event })
    }

    /**启动peer服务**/
    public async fetchConnectServer(app: NestExpressApplication) {
        this.server = ExpressPeerServer(app.getHttpServer(), {
            port: 34550,
            alive_timeout: 60000,
            path: '/peer-server'
        })

        this.server.on('connection', this.fetchServerConnection)
        // this.server.on('connection', async event => {
        // const client = await this.fetchClientJwtAuthorize(event)
        // return await this.webPeerClientService.setClient(client.user.uid, client).then(() => {})
        // console.log(client)
        // console.log(`Peer连接成功:`, { user: peer.user, token: client.getToken(), id: client.getId() })
        // })

        this.server.on('disconnect', client => {
            console.log(`Peer中断连接:`, { client, token: client.getToken(), id: client.getId() })
        })

        this.server.on('message', (client, message) => {
            console.log(`Peer message:`, {
                client,
                token: client.getToken(),
                id: client.getId(),
                message
            })
        })

        this.server.on('error', error => {
            console.error(`Peer server error: ${error.message}`, { error })
        })

        return app.use(this.server)
    }
}
