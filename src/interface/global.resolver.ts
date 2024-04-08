import { IncomingHttpHeaders } from 'http'
/**对接聚合**/
export type Omix<T = Record<any, any>> = T & Record<any, any>
/**Request headers类型**/
export type Headers = Omix<IncomingHttpHeaders>
/**获取Promise返回的类型**/
export type PromiseType<T extends Promise<any>> = T extends Promise<infer R> ? R : never
