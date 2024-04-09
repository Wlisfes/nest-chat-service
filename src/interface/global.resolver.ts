import { IncomingHttpHeaders } from 'http'

/**对接聚合**/
export type Omix<T = Record<any, any>> = T & Record<any, any>

/**Request headers类型**/
export type Headers = Omix<IncomingHttpHeaders>

/**获取Promise返回的类型**/
export type PromiseType<T extends Promise<any>> = T extends Promise<infer R> ? R : never

/**custom.service自定义配置**/
export type DivineCustomOption<T = Omix> = {
    message?: string
    status?: number
    expire?: number
    dispatch?: T
    headers?: Partial<Headers>
    cause?: Omix
}
