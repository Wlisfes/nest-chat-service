import { PickType, PartialType } from '@nestjs/swagger'
import * as entities from '@/entities/instance'
import * as env from '@/interface/instance.resolver'

/**文件上传类型**/
export class BodyBaseUploader extends PickType(entities.SchemaMediaEntier, ['source']) {}

/**文件上传File**/
export class BodyOneUploader extends PickType(entities.SchemaMediaEntier, ['source', 'file']) {}

/**媒体数据存储**/
export class BodyMediaCreater extends PartialType(entities.SchemaMediaEntier) {}
