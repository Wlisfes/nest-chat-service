import { HttpException, HttpStatus } from '@nestjs/common'
import { create } from 'svg-captcha'
import { ConsumeMessage } from 'amqplib'
import { createCanvas } from 'canvas'
import { divineHandler, divineIntNumber } from '@/utils/utils-common'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'
import * as crypto from 'crypto'
import * as stream from 'stream'
import * as sizeOf from 'image-size'
import * as pdfjsLib from 'pdfjs-dist'

/**条件捕获、异常抛出**/
export async function divineCatchWherer(where: boolean, scope: env.Omix<{ message: string; status?: number; cause?: env.Omix }>) {
    return await divineHandler(where, {
        handler: () => {
            throw new HttpException(
                scope.cause ? { message: scope.message, cause: scope.cause } : scope.message,
                scope.status ?? HttpStatus.BAD_REQUEST
            )
        }
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

/**生成MD5字符串**/
export async function divineMD5Generate(str: string) {
    const hash = crypto.createHash('md5')
    hash.update(str)
    return hash.digest('hex')
}

/**获取图片宽高比率**/
export async function divineImageResize(buffer: Buffer) {
    return sizeOf.default(buffer)
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

/**获取自定义请求头**/
export async function divineCustomizeHeaders(consume: ConsumeMessage) {
    if (consume.properties.messageId) {
        return {
            [web.WEB_COMMON_HEADER_STARTTIME]: Date.now(),
            [web.WEB_COMMON_HEADER_CONTEXTID]: consume.properties.messageId
        } as never as env.Headers
    }
    return {
        [web.WEB_COMMON_HEADER_STARTTIME]: Date.now(),
        [web.WEB_COMMON_HEADER_CONTEXTID]: await divineIntNumber({ random: true, bit: 32 })
    } as never as env.Headers
}

/**获取PDF缩略图**/
export function divineDocumentThumbnail(buffer: Buffer): Promise<Buffer> {
    return new Promise(async resolve => {
        try {
            const uint8array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
            const pdf = await pdfjsLib.getDocument({ data: uint8array }).promise
            const page = await pdf.getPage(1)
            const viewport = page.getViewport({ scale: 420 / page.view[2] })
            const canvas = createCanvas(420, 210)
            const context = canvas.getContext('2d')
            await page.render({ canvasContext: context as never, viewport: viewport }).promise
            resolve(canvas.toBuffer('image/jpeg'))
        } catch (e) {
            return await divineCatchWherer(true, { message: e.message, status: HttpStatus.INTERNAL_SERVER_ERROR })
        }
    })
}
