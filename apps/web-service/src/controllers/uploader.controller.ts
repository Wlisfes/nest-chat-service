import { Controller, Get, Post, Body, Headers, Request, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ApiTags, ApiBody } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { UploaderService } from '@/services/uploader/uploader.service'
import { ApiDecorator } from '@/decorator/compute.decorator'
import { CustomizeEnumUploadValidator } from '@/decorator/uploader.decorator'
import { divineFileRequest } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'

@ApiTags('文件存储模块')
@Controller('uploader')
export class UploaderController {
    constructor(private readonly uploader: UploaderService) {}

    @Post('/stream')
    @ApiDecorator({
        operation: { summary: '上传图片文件' },
        response: { status: 200, description: 'OK' },
        consumes: ['multipart/form-data'],
        authorize: { check: true, next: false }
    })
    @ApiBody({ type: env.BodyOneUploader })
    @UseInterceptors(FileInterceptor('file', { fileFilter: divineFileRequest }))
    public async httpStreamUploader(
        @Headers() headers: env.Headers,
        @Request() request: env.Omix<{ user: env.RestUserResolver }>,
        @Body() body: env.BodyBaseUploader,
        @UploadedFile(
            new CustomizeEnumUploadValidator({
                image: { maxSize: 10, fileType: ['jpg', 'jpeg', 'png', 'webp', 'gif'] },
                audio: { maxSize: 10, fileType: ['mp3'] },
                video: { maxSize: 20, fileType: ['mp4'] },
                document: { maxSize: 20, fileType: ['doc', 'docx', 'pdf', 'txt'] }
            })
        )
        file: Express.Multer.File
    ) {
        return await this.uploader.httpStreamUploader(headers, request.user.uid, body, file)
    }
}
