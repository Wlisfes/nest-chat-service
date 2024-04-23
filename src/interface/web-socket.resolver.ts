import { Socket } from 'socket.io'
import * as env from '@/interface/instance.resolver'

export interface AuthSocket extends Socket {
    user: env.RestUserResolver
}

/**消息状态变更**/
export interface SocketChangeMessager {
    sid: string
    userId: string
    sessionId: string
}
