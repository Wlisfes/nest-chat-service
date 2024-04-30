import { ApiProperty, PickType, PartialType, IntersectionType } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'
import { IsOptional } from '@/decorator/common.decorator'
import * as entities from '@/entities/instance'
import * as env from '@/interface/instance.resolver'

/**注册账号**/
export class BodyUserRegister extends PickType(entities.SchemaUser, ['nickname', 'email', 'password', 'code']) {}

/**登录账号**/
export class BodyUserAuthorizer extends PickType(entities.SchemaUser, ['email', 'password', 'code']) {}
/**登录账号返回值**/
export class RestUserAuthorizer extends PickType(entities.SchemaUser, ['token', 'expire']) {}

/**账号信息**/
export class RestUserResolver extends entities.UserEntier {}

/**用户基础信息更新**/
export class BodyUserUpdate extends PickType(PartialType(entities.SchemaUser), ['nickname', 'comment']) {
    @ApiProperty({ description: '头像文件ID', required: false })
    @IsOptional({ message: '头像文件ID' })
    fileId: string
}
