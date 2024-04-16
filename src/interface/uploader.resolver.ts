import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'
import { IsOptional } from '@/decorator/common.decorator'
import * as entities from '@/entities/instance'
import * as env from '@/interface/instance.resolver'

/**文件上传类型**/
export class BodyBaseUploader extends PickType(entities.SchemaMediaEntier, ['source']) {}

/**文件上传File**/
export class BodyOneUploader extends PickType(entities.SchemaMediaEntier, ['source', 'file']) {}

export class BodyPutStream extends BodyBaseUploader {
    buffer: Buffer
    name: string
    size: number
}
