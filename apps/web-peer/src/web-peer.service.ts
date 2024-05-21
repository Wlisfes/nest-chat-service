import { Injectable } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ExpressPeerServer, IClient } from 'peer'
import { LoggerService, Logger } from '@/services/logger.service'
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
    @Logger
    public async fetchServerConnection(event: IClient) {
        return await this.fetchClientJwtAuthorize(event).then(async client => {
            await this.webPeerClientService.setClient(client.user.uid, client)
            return this.logger.log(client.headers, {
                message: '建立长连接',
                socketId: client.getId(),
                user: client.user
            })
        })
    }

    /**中断连接事件**/
    @Logger
    public async fetchServerDisconnect(event: IClient) {
        return await this.fetchClientJwtAuthorize(event).then(async client => {
            const socket = await this.webPeerClientService.getClient(client.user.uid)
            if (socket && socket.getId() === client.getId()) {
                await this.webPeerClientService.disconnect(client.user.uid, true)
            }
            return this.logger.log(client.headers, {
                message: '中断长连接',
                socketId: client.getId(),
                user: client.user
            })
        })
    }

    /**启动peer服务**/
    public async fetchConnectServer(app: NestExpressApplication) {
        this.server = ExpressPeerServer(app.getHttpServer(), {
            port: 34550,
            alive_timeout: 30000, //30秒未接收到心跳会关闭连接
            path: '/web-peer-server'
        })

        /**绑定连接成功事件**/
        this.server.on('connection', this.fetchServerConnection.bind(this))
        /**绑定中断连接事件**/
        this.server.on('disconnect', this.fetchServerDisconnect.bind(this))

        return app.use(this.server)
    }
}
