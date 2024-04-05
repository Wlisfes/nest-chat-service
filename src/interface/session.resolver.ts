import { ApiProperty, PickType, IntersectionType } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min, IsEnum, IsArray } from 'class-validator'
import { Type } from 'class-transformer'
import { IsOptional } from '@/decorator/common.decorator'
import * as entities from '@/entities/instance'
import * as env from '@/interface/instance.resolver'

/**新建会话**/
export class BodySessionCreater extends PickType(entities.SchemaSession, ['source']) {
    @ApiProperty({ description: '联系人绑定关系UID', required: false, example: '2149446185344106496' })
    @IsOptional()
    @IsNotEmpty({ message: '绑定关系UID必填' })
    contact?: string

    @ApiProperty({ description: '社群UID', required: false, example: '2149446185344106496' })
    @IsOptional()
    @IsNotEmpty({ message: '社群UID必填' })
    communit?: string
}
