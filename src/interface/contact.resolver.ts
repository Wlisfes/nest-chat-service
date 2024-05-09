import { ApiProperty, PickType, IntersectionType } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min, IsEnum, IsArray } from 'class-validator'
import { Type } from 'class-transformer'
import { IsOptional } from '@/decorator/common.decorator'
import * as entities from '@/entities/instance'
import * as env from '@/interface/instance.resolver'

/**申请添加好友**/
export class BodyContactInvite extends IntersectionType(
    PickType(entities.SchemaContact, ['niveId']),
    PickType(entities.SchemaNotification, ['comment'])
) {}

/**新增好友**/
export class BodyContactCreater extends PickType(entities.SchemaUser, ['uid']) {}

/**好友关系详情**/
export class QueryContactResolver extends PickType(entities.SchemaContact, ['uid']) {}
