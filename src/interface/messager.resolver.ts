import { PickType, PartialType, IntersectionType } from '@nestjs/swagger'
import * as entities from '@/entities/instance'
import * as env from '@/interface/instance.resolver'

/**发送自定义消息**/
export class BodyCustomizeMessager extends PickType(entities.SchemaMessagerEntier, ['sessionId', 'source', 'text', 'fileId']) {}

/**自定义消息前置参数校验**/
export class BodyCheckCustomizeMessager extends PickType(entities.SchemaMessagerEntier, ['sessionId', 'source', 'text', 'fileId']) {}

/**远程呼叫查询**/
export class BodySocketCallRemoteResolver extends IntersectionType(
    PickType(entities.SchemaSession, ['sid', 'source']),
    PartialType(PickType(entities.SchemaSession, ['contactId', 'communitId']))
) {}

/**发送自定义消息通用方法**/
export class BodyCommonCustomizeMessager extends IntersectionType(
    PickType(entities.SchemaMessagerEntier, ['sessionId', 'source', 'text', 'fileId', 'referrer'])
) {}

/**验证消息文件ID数据**/
export class BodyCheckMediaMessager extends PickType(entities.SchemaMessagerEntier, ['source', 'fileId']) {}

/**获取消息详情**/
export class QuerySessionOneMessager extends PickType(entities.SchemaMessagerEntier, ['sid']) {}

/**会话消息列表**/
export class QuerySessionColumnMessager extends IntersectionType(
    PickType(entities.SchemaMessagerEntier, ['sessionId']),
    PickType(env.CommonResolver, ['offset', 'limit'])
) {}
