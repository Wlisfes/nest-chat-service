import { ClientProxy } from '@nestjs/microservices'
import * as env from '@/interface/instance.resolver'

/**微服务通讯包装**/
export function divineClientSender<T>(client: ClientProxy, scope: env.ClientPayload<env.Omix>): Promise<env.Omix<T>> {
    return new Promise((resolve, reject) => {
        client.send(scope.eventName, scope).subscribe({
            next: result => {
                resolve(result)
            },
            error: err => {
                reject(err)
            }
        })
    })
}
