import { HttpException, HttpStatus } from '@nestjs/common'
import { create } from 'svg-captcha'
import { divineHandler } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'
import * as stream from 'stream'

/**条件捕获、异常抛出**/
export async function divineCatchWherer(where: boolean, scope: env.Omix<{ message: string; status?: number; cause?: env.Omix }>) {
    return await divineHandler(where, () => {
        throw new HttpException(
            scope.cause ? { message: scope.message, cause: scope.cause } : scope.message,
            scope.status ?? HttpStatus.BAD_REQUEST
        )
    })
}

/**生成图形验证码**/
export async function divineGrapher(scope: env.Omix<{ width: number; height: number }>) {
    return create({
        fontSize: 40,
        size: 4,
        color: true,
        noise: 2,
        inverse: true,
        charPreset: 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789',
        ...scope
    })
}

/**Buffer转换Stream**/
export function divineBufferToStream(buffer: Buffer): Promise<stream.PassThrough> {
    return new Promise(resolve => {
        const fileStream = new stream.PassThrough()
        fileStream.end(buffer)
        return resolve(fileStream)
    })
}

/**Stream转换Buffer**/
export function divineStreamToBuffer(streamFile): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const buffers = []
        streamFile.on('error', reject)
        streamFile.on('data', data => buffers.push(data))
        streamFile.on('end', () => resolve(Buffer.concat(buffers)))
    })
}
