import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { Express } from 'express'
import { OSS_CLIENT, OSS_STS_CLIENT, Client, AuthClient } from '@/services/uploader/uploader.provider'
import { divineResolver, divineIntNumber, divineLogger, divineHandler } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class UploaderService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        @Inject(OSS_CLIENT) public readonly client: Client,
        @Inject(OSS_STS_CLIENT) public readonly sts: AuthClient
    ) {}

    /**上传图片文件**/
    public async httpUploaderPicturer(headers: env.Headers, uid: string, file: Express.Multer.File) {
        try {
            console.log(file)
            return await divineResolver({ message: '上传成功' })
        } catch (e) {
            this.logger.error(
                [UploaderService.name, this.httpUploaderPicturer.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
