import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CustomService } from '@/services/custom.service'
import { OSS_CLIENT, OSS_STS_CLIENT, Client, AuthClient } from '@/services/uploader/uploader.provider'
import { request, divineBytefor, divineResolver, divineIntNumber, divineLogger, divineFileNameReplace } from '@/utils/utils-common'
import { divineImageResize, divineDocumentThumbnail } from '@/utils/utils-plugin'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'
import { Response } from 'express'

@Injectable()
export class UploaderService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        @Inject(OSS_CLIENT) public readonly client: Client,
        @Inject(OSS_STS_CLIENT) public readonly sts: AuthClient,
        private readonly customService: CustomService
    ) {}

    /**媒体数据存储**/
    private async httpMediaCreater(headers: env.Headers, scope: env.BodyMediaCreater) {
        try {
            return await this.customService.divineCreate(this.customService.tableMedia, {
                headers,
                state: scope
            })
        } catch (e) {
            this.logger.error(
                [UploaderService.name, this.httpMediaCreater.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**上传文件到阿里云OSS**/
    public async putStream(headers, scope: env.Omix<env.BodyBaseUploader & { buffer: Buffer; name: string; size: number }>) {
        try {
            const suffix = scope.name.split('.').pop().toLowerCase()
            const fileId = await divineIntNumber()
            const fileSize = await divineBytefor(scope.size)
            const folder = ['chat', scope.source, fileId + '.' + suffix].join('/')
            this.logger.info(
                [UploaderService.name, this.putStream.name].join(':'),
                divineLogger(headers, { message: '开始上传', result: { fileId, folder, fileName: scope.name, fileSize } })
            )
            return await this.client.put(folder, scope.buffer).then(async ({ name: fieldName, url }: any) => {
                this.logger.info(
                    [UploaderService.name, this.putStream.name].join(':'),
                    divineLogger(headers, {
                        message: '上传成功',
                        result: { fileId, folder, fileName: scope.name, fileSize, fieldName, url }
                    })
                )
                return await divineResolver({ message: '上传成功', fileId, folder, fileName: scope.name, fieldName, url })
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
            const { status, data, request: req } = await request.get(fileURL, { responseType: 'arraybuffer' })
            if (status === HttpStatus.OK) {
                const buffer = Buffer.from(data)
                const fileSize: string = await divineBytefor(buffer.length)
                const fileName: string = req.path.split('/').pop()
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
    public async httpStreamUploader(
        headers: env.Headers,
        userId: string,
        scope: env.BodyBaseUploader,
        file: env.Omix<Express.Multer.File>
    ) {
        const connect = await this.customService.divineConnectTransaction()
        try {
            return await this.putStream(headers, {
                buffer: file.buffer,
                name: file.name,
                size: file.size,
                source: scope.source
            }).then(async data => {
                const params: env.Omix<Partial<entities.MediaEntier>> = {
                    userId: userId,
                    fileSize: file.size,
                    source: scope.source,
                    fileName: data.fileName,
                    fileId: data.fileId,
                    fieldName: data.fieldName,
                    folder: data.folder,
                    fileURL: data.url,
                    width: 0,
                    height: 0
                }
                /**图片资源上传**/
                if (entities.MediaEntierSource.image === scope.source) {
                    const { width, height } = await divineImageResize(file.buffer)
                    params.width = width
                    params.height = height
                }
                /**PDF文档上传**/
                if (scope.source === entities.MediaEntierSource.document && file.mimetype === 'application/pdf') {
                    const buffer = await divineDocumentThumbnail(file.buffer)
                    await this.putStream(headers, {
                        name: await divineFileNameReplace(data.fileName, 'jpeg'),
                        buffer: buffer,
                        source: entities.MediaEntierSource.image,
                        size: buffer.length
                    }).then(async response => {
                        const { fileId, fileName, fieldName, fileURL, folder, fileSize } = await this.httpMediaCreater(headers, {
                            source: entities.MediaEntierSource.image,
                            userId: userId,
                            fileName: response.fileName,
                            fileSize: buffer.length,
                            fileId: response.fileId,
                            fieldName: response.fieldName,
                            folder: response.folder,
                            fileURL: response.url,
                            width: 420,
                            height: 210
                        })
                        ;(data as env.Omix).depater = { fileId, fileName, fieldName, url: fileURL, folder }
                        return (params.depater = fileId)
                    })
                }
                await this.httpMediaCreater(headers, params)
                return await connect.commitTransaction().then(async () => {
                    return await divineResolver(data)
                })
            })
        } catch (e) {
            await connect.rollbackTransaction()
            this.logger.error(
                [UploaderService.name, this.httpStreamUploader.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        } finally {
            await connect.release()
        }
    }
}
