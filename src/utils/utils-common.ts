import { snowflakeId } from 'snowflake-id-maker'

/**生成纯数字的雪花ID**/
export async function divineIntNumber(scope: Partial<Omix<{ worker: number; epoch: number }>> = {}): Promise<string> {
    return snowflakeId({
        worker: scope.worker ?? process.pid,
        epoch: scope.epoch ?? 1199145600000
    })
}
