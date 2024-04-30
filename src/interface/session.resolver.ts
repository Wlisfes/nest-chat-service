import { ApiProperty, PickType, PartialType, IntersectionType } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min, IsEnum, IsArray } from 'class-validator'
import { Type } from 'class-transformer'
import { IsOptional } from '@/decorator/common.decorator'
import * as entities from '@/entities/instance'
import * as env from '@/interface/instance.resolver'

/**新建私聊会话**/
export class BodySessionContactCreater extends PickType(entities.SchemaSession, ['contactId']) {}

/**新建群聊会话**/
export class BodySessionCommunitCreater extends PickType(entities.SchemaSession, ['communitId']) {}

/**会话列表**/
export class BodySessionColumn extends PickType(PartialType(entities.SchemaSession), ['source']) {}

/**会话详情**/
export class BodySessionOneResolver extends PickType(entities.SchemaSession, ['sid']) {}
