import { Controller, Get, Post, Body, Headers, Request, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ApiTags, ApiBody } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { Express } from 'express'
import { UploaderService } from '@/services/uploader/uploader.service'
import { ApiDecorator } from '@/decorator/compute.decorator'
import { CustomUploaderValidator } from '@/decorator/uploader.decorator'
import * as env from '@/interface/instance.resolver'

@ApiTags('文件存储模块')
@Controller('uploader')
export class UploaderController {
    constructor(private readonly uploader: UploaderService) {}

    @Post('/picturer')
    @ApiDecorator({
        operation: { summary: '上传图片文件' },
        response: { status: 200, description: 'OK' },
        consumes: ['multipart/form-data'],
        authorize: { check: true, next: false }
    })
    @ApiBody({ type: env.BodyUploaderFile })
    @UseInterceptors(FileInterceptor('file'))
    public async httpUploaderPicturer(
        @Headers() headers: env.Headers,
        @Request() request: env.Omix<{ user: env.RestUserResolver }>,
        @UploadedFile(
            ...CustomUploaderValidator([
                { fileType: RegExp('^image/'), message: '文件类型错误' },
                { maxSize: 1024 * 1024 * 5, message: '文件大小不能超过5MB' }
            ])
        )
        file: Express.Multer.File
    ) {
        return await this.uploader.httpUploaderPicturer(headers, request.user.uid, file)
    }
}
