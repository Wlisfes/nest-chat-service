import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { OSS_CLIENT, OSS_STS_CLIENT, Client, AuthClient } from '@/services/uploader/uploader.provider'
import { divineResolver, divineIntNumber, divineLogger } from '@/utils/utils-common'
import { divineBufferToStream } from '@/utils/utils-plugin'
import request from 'axios'
import * as env from '@/interface/instance.resolver'
import * as path from 'path'

@Injectable()
export class UploaderService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        @Inject(OSS_CLIENT) public readonly client: Client,
        @Inject(OSS_STS_CLIENT) public readonly sts: AuthClient
    ) {}

    /**上传文件到阿里云OSS**/
    private async putStream(
        headers,
        scope: {
            fileFolder: keyof typeof env.EnumUploadFolder
            buffer: Buffer
            fileName: string
            fileSize: number
        }
    ) {
        try {
            const suffix = path.extname(file.originalname).toLowerCase()
            const fileId = await divineIntNumber({ random: true, bit: 32 })
            const folder = ['chat', fileFolder, fileId + suffix].join('/')
            const fileSize = (file.size / 1024 / 1024).toFixed(2) + 'MB'
            const fileName = file.originalname
            this.logger.info(
                [UploaderService.name, this.putStream.name].join(':'),
                divineLogger(headers, { message: '开始上传', result: { fileId, folder, fileName, fileSize } })
            )
            const stream = await divineBufferToStream(file.buffer)
            return await this.client.putStream(folder, stream).then(async ({ name: fieldName, url }: any) => {
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
            const response = await request.get(fileURL, { responseType: 'arraybuffer' })
            if (response.status === HttpStatus.OK) {
                const buffer = Buffer.from(response.data)
                const fileSize = buffer.length
                const fileName = response.request.path.split('/').pop()
                this.logger.info(
                    [UploaderService.name, this.httpStreamRemoter.name].join(':'),
                    divineLogger(headers, { message: '远程文件拉取成功', fileURL, fileName, fileSize })
                )
                return await divineResolver({ buffer, fileName, fileSize })
            }
            throw new HttpException('远程文件拉取失败', response.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
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
            await this.httpStreamRemoter(headers, `http://cdn.u2.huluxia.com/g3/M02/31/D4/wKgBOVwNb4iAKEluAABJ-mVGzTI80.jpeg`)

            // return await this.putStream(headers, file, scope.folder as keyof typeof env.EnumUploadFolder)
        } catch (e) {
            this.logger.error(
                [UploaderService.name, this.httpStreamUploader.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
