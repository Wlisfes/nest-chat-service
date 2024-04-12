import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { OSS_CLIENT, OSS_STS_CLIENT, Client, AuthClient } from '@/services/uploader/uploader.provider'
import { request, divineBytefor, divineResolver, divineIntNumber, divineLogger } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class UploaderService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        @Inject(OSS_CLIENT) public readonly client: Client,
        @Inject(OSS_STS_CLIENT) public readonly sts: AuthClient
    ) {}

    /**上传文件到阿里云OSS**/
    private async putStream(headers, { buffer, name: fileName, size, folder: path }: env.BodyPutStream) {
        try {
            const suffix = fileName.split('.').pop().toLowerCase()
            const fileId = await divineIntNumber({ random: true, bit: 32 })
            const fileSize = await divineBytefor(size)
            const folder = ['chat', path, fileId + '.' + suffix].join('/')
            this.logger.info(
                [UploaderService.name, this.putStream.name].join(':'),
                divineLogger(headers, { message: '开始上传', result: { fileId, folder, fileName, fileSize } })
            )
            return await this.client.put(folder, buffer).then(async ({ name: fieldName, url }: any) => {
                this.logger.info(
                    [UploaderService.name, this.putStream.name].join(':'),
                    divineLogger(headers, { message: '上传成功', result: { fileId, folder, fileName, fileSize, fieldName, url } })
                )
                return await divineResolver({ message: '上传成功', fileId, folder, fileName, fieldName, url })
            })
        } catch (e) {
            this.logger.error(
                [UploaderService.name, this.putStream.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**拉取远程文件**/
    public async httpStreamRemoter(headers: env.Headers, fileURL: string) {
        try {
            const { status, data, request: t } = await request.get(fileURL, { responseType: 'arraybuffer' })
            if (status === HttpStatus.OK) {
                const buffer = Buffer.from(data)
                const fileSize = await divineBytefor(buffer.length)
                const fileName = t.path.split('/').pop()
                this.logger.info(
                    [UploaderService.name, this.httpStreamRemoter.name].join(':'),
                    divineLogger(headers, { message: '远程文件拉取成功', fileURL, fileName, fileSize })
                )
                return await divineResolver({ buffer, name: fileName, size: buffer.length })
            }
            throw new HttpException('远程文件拉取失败', status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        } catch (e) {
            this.logger.error(
                [UploaderService.name, this.httpStreamRemoter.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**文件上传**/
    public async httpStreamUploader(headers: env.Headers, uid: string, scope: env.BodyBaseUploader, file: Express.Multer.File) {
        try {
            // const { buffer, name, size } = await this.httpStreamRemoter(
            //     headers,
            //     `http://cdn.u2.huluxia.com/g3/M02/31/D4/wKgBOVwNb4iAKEluAABJ-mVGzTI80.jpeg`
            // )
            // return await this.putStream(headers, { buffer, size, name, folder: scope.folder })
            // buffer: file.buffer,
            // name: file.originalname,
            // size: file.size
            return await this.putStream(headers, {
                buffer: file.buffer,
                name: file.originalname,
                size: file.size,
                folder: scope.folder
            })
        } catch (e) {
            this.logger.error(
                [UploaderService.name, this.httpStreamUploader.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
