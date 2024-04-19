import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'
import { IsOptional } from '@/decorator/common.decorator'
import * as entities from '@/entities/instance'
import * as env from '@/interface/instance.resolver'

export class CommonResolver {
    @ApiProperty({ description: 'keyId', example: 1 })
    @IsNotEmpty({ message: 'keyId 必填' })
    keyId: number

    @ApiProperty({ description: '分页偏移量', required: false, example: 0 })
    @IsOptional()
    @IsNumber({}, { message: 'offset必须是数字' })
    @Min(0, { message: 'offset必须大于或等于0' })
    @Type(type => Number)
    offset: number = 0

    @ApiProperty({ description: '分页数量', required: false, example: 10 })
    @IsOptional()
    @IsNumber({}, { message: 'limit必须是数字' })
    @Min(1, { message: 'limit必须大于0' })
    @Type(type => Number)
    limit: number = 10
}

export class NoticeResolver {
    @ApiProperty({ description: 'message', example: '提示信息' })
    message: string
}

export class BodyCommonNodemailerSender extends PickType(entities.SchemaUser, ['email']) {
    @ApiProperty({ description: '邮件验证码类型', enum: env.EnumMailSource, example: env.EnumMailSource.register })
    @IsNotEmpty({ message: '类型 必填' })
    @IsEnum(env.EnumMailSource, { message: '类型错误' })
    source: env.EnumMailSource
}
