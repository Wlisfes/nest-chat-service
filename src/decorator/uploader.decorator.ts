import { Injectable, HttpException, HttpStatus, PipeTransform, ArgumentMetadata } from '@nestjs/common'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

/**文件类型配置**/
export type UploadRuleOption = {
    [key in keyof typeof entities.MediaEntierSource]?: {
        fileType: string[]
        maxSize: number
    }
}

/**自定义文件验证**/
@Injectable()
export class CustomizeEnumUploadValidator implements PipeTransform {
    constructor(private readonly rules: UploadRuleOption) {}
    transform(file: env.Omix<Express.Multer.File>, metadata: ArgumentMetadata) {
        const folder = file.body.folder
        const { fileType = [], maxSize = 0 } = (this.rules[folder] ?? {}) as never
        if (Object.values(this.rules).length === 0) {
            throw new HttpException('未配置文件上传规则', HttpStatus.INTERNAL_SERVER_ERROR)
        }
        if ((fileType ?? []).length > 0 || (maxSize ?? 0) > 0) {
            if (!fileType.some(rule => file.mimetype.includes(rule))) {
                throw new HttpException({ message: '文件类型错误', cause: fileType }, HttpStatus.BAD_REQUEST)
            }
            if (file.size / 1024 / 1024 > maxSize) {
                throw new HttpException(`文件大小不能超过${maxSize}MB`, HttpStatus.BAD_REQUEST)
            }
        }
        return file
    }
}
