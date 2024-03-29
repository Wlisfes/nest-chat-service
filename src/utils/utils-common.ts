import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'
import { snowflakeId } from 'snowflake-id-maker'
import { Omix } from '@/interface/global.resolver'
dayjs.extend(timezone)
dayjs.extend(utc)

/**dayjs实例**/
export const moment = dayjs

/**生成纯数字的雪花ID、随机字符串**/
export async function divineIntNumber(scope: Partial<Omix<{ worker: number; epoch: number; random: boolean; bit: number }>> = {}) {
    if (scope.random) {
        return Array.from({ length: scope.bit ?? 6 }, x => Math.floor(Math.random() * 9) + 1).join('')
    }
    return snowflakeId({
        worker: scope.worker ?? process.pid,
        epoch: scope.epoch ?? 1199145600000
    })
}

/**返回包装**/
export async function divineResolver<T = Partial<Omix<{ message: string; list: Array<Omix>; total: number; page: number; size: number }>>>(
    data: T
) {
    return data
}
