import { ApiProperty, PickType, IntersectionType } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min, IsEnum, IsArray } from 'class-validator'
import { Type } from 'class-transformer'
import { IsOptional } from '@/decorator/common.decorator'
import * as entities from '@/entities/instance'
import * as env from '@/interface/instance.resolver'

/**新建私聊会话**/
export class BodySessionContactCreater extends PickType(entities.SchemaSession, ['contactId']) {}

/**新建群聊会话**/
export class BodySessionCommunitCreater extends PickType(entities.SchemaSession, ['communitId']) {}
