import { Request } from 'express'
import { snowflakeId } from 'snowflake-id-maker'
import { zh_CN, Faker } from '@faker-js/faker'
import { isNotEmpty } from 'class-validator'
import * as web from '@/config/web-instance'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'
import * as env from '@/interface/instance.resolver'
import * as axios from 'axios'
dayjs.extend(timezone)
dayjs.extend(utc)

/**dayjs实例**/
export const moment = dayjs

/**Axios请求实例**/
export const request = axios.default

/**虚拟数据实例**/
export const faker = new Faker({
    locale: zh_CN
})

/**生成纯数字的雪花ID、随机字符串**/
export async function divineIntNumber(scope: Partial<env.Omix<{ worker: number; epoch: number; random: boolean; bit: number }>> = {}) {
    if (scope.random) {
        return Array.from({ length: scope.bit ?? 6 }, x => Math.floor(Math.random() * 9) + 1).join('')
    }
    return snowflakeId({
        worker: scope.worker ?? process.pid,
        epoch: scope.epoch ?? 1199145600000
    })
}

/**返回包装**/
export async function divineResolver<
    T = Partial<env.Omix<{ message: string; list: Array<env.Omix>; total: number; page: number; size: number }>>
>(data: T, handler?: Function) {
    await divineHandler(Boolean(handler), { handler })
    return data
}

/**条件链式执行函数**/
export async function divineHandler<T>(where: boolean | Function, scope: env.Omix<{ handler: Function; failure?: Function }>): Promise<T> {
    if (typeof where === 'function') {
        where = await where()
    }
    if (where) {
        return await scope.handler()
    } else {
        return (await scope.failure?.()) ?? undefined
    }
}

/**批量执行异步方法**/
export async function divineBatchHandler(handlers: Array<any>, scope: env.Omix<{ handler?: Function; failure?: Function }> = {}) {
    try {
        return await Promise.all(handlers).then(async response => {
            return await divineHandler(Boolean(scope.handler), {
                handler: () => scope.handler(response)
            })
        })
    } catch (e) {
        return await divineHandler(Boolean(scope.failure), {
            handler: () => scope.failure!(e)
        })
    }
}

/**延时方法**/
export function divineDelay(delay = 100, handler?: Function) {
    return new Promise(resolve => {
        const timeout = setTimeout(() => {
            handler?.()
            resolve(undefined)
            clearTimeout(timeout)
        }, delay)
    })
}

/**条件值返回**/
export function divineCaseWherer<T>(where: boolean, scope: env.Omix<{ value: T; fallback?: T; defaultValue?: T }>): T {
    if (where) {
        return scope.value ?? scope.defaultValue
    }
    return scope.fallback ?? scope.defaultValue
}

/**参数组合**/
export async function divineParameter<T>(params: env.Omix<T>): Promise<env.Omix<T>> {
    return params
}

/**日志聚合**/
export function divineLogger(headers: env.Omix<env.Headers> = {}, log: env.Omix | string = {}) {
    const duration = headers[web.WEB_COMMON_HEADER_STARTTIME]
    return {
        log,
        duration: divineCaseWherer(isNotEmpty(duration), { value: `${Date.now() - Number(duration)}ms`, defaultValue: null }),
        [web.WEB_COMMON_HEADER_CONTEXTID]: headers[web.WEB_COMMON_HEADER_CONTEXTID]
    }
}

/**提取日志参数**/
export function divineBstract(headers: env.Omix<env.Headers> = {}) {
    return {
        logId: headers[web.WEB_COMMON_HEADER_CONTEXTID],
        ua: headers['user-agent'] ?? null,
        ip: headers.ip ?? null,
        browser: headers.browser ?? null,
        platform: headers.platform ?? null
    }
}

/**自定义Error信息**/
export function divineCustomizeError<T = { message: string; status: number }>(scope: env.Omix<T>): env.Omix<env.CustomizeError<T>> {
    const err = new Error(scope.message) as env.CustomizeError<T>
    err.data = scope
    return err
}

/**字节转换文字输出**/
export async function divineBytefor(byte: number, dec: number = 2) {
    if (byte === 0) return 'Byte'
    const k = 1024
    const dm = dec < 0 ? 0 : dec
    const sizes = ['Byte', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(byte) / Math.log(k))
    return parseFloat((byte / Math.pow(k, i)).toFixed(dm)) + sizes[i]
}

/**redis存储键组合方法**/
export async function divineKeyCompose(namespaces: string, ...args: string[]) {
    return [namespaces, ...args].filter(key => isNotEmpty(key)).join(':')
}

/**邮箱号混淆**/
export async function divineMaskCharacter(type: 'email', str: string) {
    if (type === 'email') {
        const prefix = str.substring(0, str.indexOf('@'))
        const suffix = str.substring(str.indexOf('@'), str.length)
        const fill = prefix.length >= 2 ? prefix.substring(0, 2) : prefix
        return fill.padEnd(8, '*') + suffix
    }
    return str
}

/**文件名称、类型挂载**/
export function divineFileRequest(request: Request, file: env.Omix, cb: Function) {
    file.body = request.body
    file.name = Buffer.from(file.originalname, 'binary').toString('utf-8')
    return cb(null, true)
}

/**替换文件后辍名**/
export async function divineFileNameReplace(fileName: string, suffix: string) {
    if (fileName.includes('.')) {
        return fileName.replace(/\.[^.]+$/, `.${suffix}`)
    }
    return [fileName, suffix].join('.')
}
