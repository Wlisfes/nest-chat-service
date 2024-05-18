import { Injectable } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ExpressPeerServer } from 'peer'

@Injectable()
export class WebPeerService {
    private server: ReturnType<typeof ExpressPeerServer>
    /**启动peer服务**/
    public async divineConnectServer(app: NestExpressApplication) {
        this.server = ExpressPeerServer(app.getHttpServer(), {
            port: 34550,
            alive_timeout: 60000,
            path: '/peer-server'
        })

        this.server.on('connection', client => {
            console.log(`Peer connected:`, { token: client.getToken(), id: client.getId() })
        })

        this.server.on('disconnect', client => {
            console.log(`Peer disconnected:`, { token: client.getToken(), id: client.getId() })
        })

        this.server.on('message', (client, message) => {
            console.log(`Peer message:`, {
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
