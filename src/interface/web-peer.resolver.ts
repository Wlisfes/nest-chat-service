import { IClient } from 'peer'
import * as env from '@/interface/instance.resolver'

export interface AuthClient extends IClient {
    user: env.RestUserResolver
    headers: env.Headers
}
