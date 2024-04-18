import { ApiProperty, PickType, IntersectionType } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min, IsEnum, IsArray } from 'class-validator'
import { Type } from 'class-transformer'
import { IsOptional } from '@/decorator/common.decorator'
import * as entities from '@/entities/instance'
import * as env from '@/interface/instance.resolver'

/**发送自定义消息**/
export class BodyCustomizeMessager extends PickType(entities.SchemaMessagerEntier, ['sessionId', 'source', 'text', 'fileId']) {}

/**自定义消息前置参数校验**/
export class BodyCheckCustomizeMessager extends PickType(entities.SchemaMessagerEntier, ['sessionId', 'source', 'text', 'fileId']) {}

/**发送自定义消息通用方法**/
export class BodyCommonCustomizeMessager extends PickType(entities.SchemaMessagerEntier, [
    'sessionId',
    'source',
    'text',
    'fileId',
    'referrer'
]) {}

/**验证消息文件ID数据**/
export class BodyCheckMediaMessager extends PickType(entities.SchemaMessagerEntier, ['source', 'fileId']) {}

/**HTTP接口发送自定义消息**/
export class BodyCustomizeMessagerTransmitter extends BodyCheckCustomizeMessager {}
