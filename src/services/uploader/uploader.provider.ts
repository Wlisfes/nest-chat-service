import * as OSS from 'ali-oss'
export const OSS_CLIENT = Symbol('ALIYUN_OSS_CLIENT')
export const OSS_STS_CLIENT = Symbol('ALIYUN_OSS_STS_CLIENT')
import * as env from '@/interface/instance.resolver'
export type Client = env.PromiseType<ReturnType<typeof createClient>>
export type AuthClient = env.PromiseType<ReturnType<typeof createAuthClient>>

export interface AuthClientOption {
    accessKeyId: string
    accessKeySecret: string
}
export interface ClientOption extends AuthClientOption {
    region: string
    endpoint: string
    bucket: string
    timeout: number
    internal?: boolean
    secure?: boolean
    cname?: boolean
}

/**OSS上传实例**/
export async function createClient(option: ClientOption) {
    return new OSS({
        region: option.region,
        endpoint: option.endpoint,
        accessKeyId: option.accessKeyId,
        accessKeySecret: option.accessKeySecret,
        bucket: option.bucket,
        timeout: option.timeout,
        internal: option.internal ?? false,
        secure: option.secure ?? true,
        cname: option.cname ?? true
    })
}

/**OSS授权实例**/
export async function createAuthClient(option: AuthClientOption) {
    return new OSS.STS({
        accessKeyId: option.accessKeyId,
        accessKeySecret: option.accessKeySecret
    })
}
