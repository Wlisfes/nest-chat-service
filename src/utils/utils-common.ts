import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as timezone from 'dayjs/plugin/timezone'
import { snowflakeId } from 'snowflake-id-maker'
import { Omix } from '@/interface/global.resolver'
dayjs.extend(timezone)
dayjs.extend(utc)

/**dayjs实例**/
export const moment = dayjs

/**生成纯数字的雪花ID**/
export async function divineIntNumber(scope: Partial<Omix<{ worker: number; epoch: number }>> = {}) {
    return snowflakeId({
        worker: scope.worker ?? process.pid,
        epoch: scope.epoch ?? 1199145600000
    })
}
