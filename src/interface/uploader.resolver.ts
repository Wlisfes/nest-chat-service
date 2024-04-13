import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'
import { IsOptional } from '@/decorator/common.decorator'
import * as entities from '@/entities/instance'
import * as env from '@/interface/instance.resolver'

export class BodyBaseUploader {
    @ApiProperty({ description: '上传类型: ', enum: env.EnumUploadFolder, example: env.EnumUploadFolder.avatar })
    @IsNotEmpty({ message: '上传类型必填' })
    @IsEnum(env.EnumUploadFolder, { message: '上传类型错误' })
    folder: env.EnumUploadFolder
}

export class BodyPutStream extends BodyBaseUploader {
    buffer: Buffer
    name: string
    size: number
}

export class BodyOneUploader extends BodyBaseUploader {
    @ApiProperty({ type: 'string', format: 'binary' })
    @IsNotEmpty({ message: 'file文件不能为空' })
    file: File
}
