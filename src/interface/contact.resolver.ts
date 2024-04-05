import { ApiProperty, PickType, IntersectionType } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min, IsEnum, IsArray } from 'class-validator'
import { Type } from 'class-transformer'
import { IsOptional } from '@/decorator/common.decorator'
import * as entities from '@/entities/instance'
import * as env from '@/interface/instance.resolver'

/**新增联系人**/
export class BodyContactCreater extends PickType(entities.SchemaUser, ['uid']) {}
