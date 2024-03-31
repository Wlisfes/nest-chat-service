import { HttpException, HttpStatus } from '@nestjs/common'
import { create } from 'svg-captcha'
import { divineHandler } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'

/**条件捕获、异常抛出**/
export async function divineCatchWherer(where: boolean, scope: env.Omix<{ message: string; status?: number }>) {
    return await divineHandler(where, () => {
        throw new HttpException(scope.message, scope.status ?? HttpStatus.BAD_REQUEST)
    })
}

/**生成图形验证码**/
export async function divineGrapher(scope: env.Omix<{ width: number; height: number }>) {
    return create(Object.assign({ fontSize: 40, size: 4, color: true, noise: 2, inverse: true, charPreset: '123456789' }, scope))
}
