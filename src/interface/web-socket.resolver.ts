import { Socket } from 'socket.io'
import * as env from '@/interface/instance.resolver'

export interface AuthSocket extends Socket {
    user: env.RestUserResolver
}
