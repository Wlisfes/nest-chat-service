import { ApiProperty, PickType, IntersectionType } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'
import { IsOptional } from '@/decorator/common.decorator'
import * as entities from '@/entities/instance'
import * as env from '@/interface/instance.resolver'

/**新建社群**/
export class BodyCommunitCreater extends PickType(entities.SchemaCommunit, ['name']) {}
