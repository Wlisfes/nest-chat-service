import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsEnum } from 'class-validator'
import { CommonEntier } from '@/utils/utils-typeorm'

/**操作日志表: 日志类型**/
export enum EnumLoggerSource {
    login = 'login'
}

@Entity({ name: 'logger', comment: '操作日志表' })
export class LoggerEntier extends CommonEntier {
    @ApiProperty({ description: '日志ID' })
    @IsNotEmpty({ message: '日志ID必填' })
    @Index()
    @Column({ length: 32, comment: '日志ID', nullable: false })
    uid: string

    @ApiProperty({ description: '日志类型: 登录-login', enum: EnumLoggerSource })
    @IsNotEmpty({ message: '日志类型必填' })
    @IsEnum(EnumLoggerSource, { message: '日志类型参数格式错误' })
    @Column({ comment: '日志类型: 登录-login', nullable: false })
    source: string

    @ApiProperty({ description: '操作用户ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '操作用户ID必填' })
    @Index()
    @Column({ comment: '操作用户ID', nullable: false })
    userId: string

    @ApiProperty({ description: '请求源' })
    @Column({ comment: '请求源', nullable: true })
    browser: string

    @ApiProperty({ description: '操作源' })
    @Column({ comment: '操作源', nullable: true })
    platform: string

    @ApiProperty({ description: '详细信息' })
    @Column({ comment: '详细信息', nullable: true })
    ua: string

    @ApiProperty({ description: '操作前记录' })
    @Column({ comment: '操作前记录', nullable: true })
    before: string

    @ApiProperty({ description: '操作后记录' })
    @Column({ comment: '操作后记录', nullable: true })
    after: string
}

export class SchemaLoggerEntier extends LoggerEntier {}
