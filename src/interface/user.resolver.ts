import { ApiProperty, PickType, PartialType, IntersectionType } from '@nestjs/swagger'
import { IsOptional } from '@/decorator/common.decorator'
import * as entities from '@/entities/instance'

/**注册账号**/
export class BodyUserRegister extends PickType(entities.SchemaUser, ['nickname', 'email', 'password', 'code']) {}

/**登录账号**/
export class BodyUserAuthorizer extends PickType(entities.SchemaUser, ['email', 'password', 'code']) {}
/**登录账号返回值**/
export class RestUserAuthorizer extends PickType(entities.SchemaUser, ['token', 'expire', 'factor', 'email']) {}

/**双因子认证**/
export class BodyUserfactor extends PickType(entities.SchemaUser, ['uid', 'code']) {}
/**发送双因子认证验证码**/
export class BodyUserfactorSender extends PickType(entities.SchemaUser, ['uid']) {}
/**双因子认证返回值**/
export class RestUserfactor extends PickType(entities.SchemaUser, ['token', 'expire']) {}

/**账号信息**/
export class RestUserResolver extends entities.UserEntier {}

/**用户基础信息更新**/
export class BodyUserUpdate extends IntersectionType(
    PickType(PartialType(entities.SchemaUser), ['nickname', 'comment', 'theme', 'color', 'paint', 'sound', 'notify', 'factor', 'limit'])
) {
    @ApiProperty({ description: '头像文件ID', required: false })
    @IsOptional({ message: '头像文件ID' })
    fileId: string
}
