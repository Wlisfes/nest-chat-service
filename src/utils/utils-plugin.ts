import { HttpException, HttpStatus } from '@nestjs/common'
import { divineHandler } from '@/utils/utils-common'
import * as env from '@/interface/instance'

/**条件捕获、异常抛出**/
export async function divineCatchWherer(where: boolean, scope: env.Omix<{ message: string; code?: number }>) {
    return await divineHandler(where, () => {
        throw new HttpException(scope.message, scope.code ?? HttpStatus.BAD_REQUEST)
    })
}
