import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'
import { IsOptional } from '@/decorator/common.decorator'
import * as entities from '@/entities/instance'
import * as env from '@/interface/instance.resolver'

export class BodyUploaderFile {
    @ApiProperty({ type: 'string', format: 'binary' })
    @IsNotEmpty({ message: 'file文件不能为空' })
    file: File
}
