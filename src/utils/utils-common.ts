import { snowflakeId } from 'snowflake-id-maker'
import * as web from '@/config/instance'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'
import * as env from '@/interface/instance'
dayjs.extend(timezone)
dayjs.extend(utc)

/**dayjs实例**/
export const moment = dayjs

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
>(data: T) {
    return data
}

/**条件链式执行函数**/
export async function divineHandler(where: boolean | Function, handler: Function) {
    if (typeof where === 'function') {
        const value = where()
        return value && handler ? await handler() : undefined
    } else if (Boolean(where)) {
        return handler ? await handler() : undefined
    }
    return undefined
}

/**条件值返回**/
export function divineWherer<T>(where: boolean, value: T, defaultValue: T = undefined): T {
    return where ? value : defaultValue
}

/**日志聚合**/
export function divineLogger(headers: env.Omix<env.Headers>, log: env.Omix | string = {}) {
    return {
        log,
        requestId: headers[web.WEB_COMMON_HEADER_REQUESTID],
        duration: `${Date.now() - Number(headers[web.WEB_COMMON_HEADER_STARTTIME])}ms`
    }
}
