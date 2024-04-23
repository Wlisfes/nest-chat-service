import { Socket } from 'socket.io'
import * as env from '@/interface/instance.resolver'

export interface AuthSocket extends Socket {
    user: env.RestUserResolver
}

/**Socket推送消息至客户端**/
export interface BodySocketPushCustomizeMessager {
    sid: string
    referrer: string
    userId: string
    sessionId: string
}

/**消息状态变更**/
export interface BodySocketChangeMessager {
    sid: string
    userId: string
    sessionId: string
}
