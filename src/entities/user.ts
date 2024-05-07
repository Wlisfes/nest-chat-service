import { Entity, Column, Index } from 'typeorm'
import { hashSync } from 'bcryptjs'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsEmail, IsNumber, IsEnum, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'
import { CommonEntier } from '@/utils/utils-typeorm'

/**用户表: 状态**/
export enum EnumUserStatus {
    disable = 'disable',
    enable = 'enable'
}
/**用户表: 主题**/
export enum EnumUserTheme {
    light = 'light',
    dark = 'dark'
}
/**验证类型**/
export enum EnumUserType {
    email = 'email',
    phone = 'phone'
}
/**验证码类型**/
export enum EnumUserSource {
    register = 'register',
    factor = 'factor',
    change = 'change'
}

@Entity({ name: 'user', comment: '用户表' })
export class UserEntier extends CommonEntier {
    @ApiProperty({ description: 'UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: 'UID必填' })
    @Column({ comment: '唯一UUID', length: 32, nullable: false })
    @Index()
    uid: string

    @ApiProperty({ description: '状态: 禁用-disable、启用-enable', enum: EnumUserStatus })
    @IsNotEmpty({ message: '状态必填' })
    @IsEnum(EnumUserStatus, { message: '状态参数格式错误' })
    @Column({ comment: '状态: 禁用-disable、启用-enable', length: 32, default: 'enable', nullable: false })
    status: string

    @ApiProperty({ description: '昵称', example: '妖雨纯' })
    @IsNotEmpty({ message: '昵称必填' })
    @Length(2, 32, { message: '昵称必须保持2~32位' })
    @Column({ comment: '昵称', length: 32, nullable: false })
    nickname: string

    @ApiProperty({ description: '头像' })
    @IsNotEmpty({ message: '头像必填' })
    @Length(4, 255, { message: '头像地址必须保持4~255位' })
    @Column({ comment: '头像', nullable: false })
    avatar: string

    @ApiProperty({ description: '邮箱', example: 'limvcfast@gmail.com' })
    @IsNotEmpty({ message: '邮箱必填' })
    @IsEmail({}, { message: '邮箱格式错误' })
    @Length(4, 32, { message: '邮箱必须保持4~64位' })
    @Column({ comment: '邮箱', length: 64, nullable: false })
    email: string

    @ApiProperty({ description: '状态描述', example: '你好，我正在使用Chat盒子' })
    @IsNotEmpty({ message: '状态描述必填' })
    @Length(2, 128, { message: '状态描述必须保持2~128位' })
    @Column({ comment: '状态描述', length: 128, nullable: false })
    comment: string

    @ApiProperty({ description: '密码', example: 'MTIzNDU2' })
    @IsNotEmpty({ message: '密码必填' })
    @Length(6, 32, { message: '密码必须保持6~32位' })
    @Column({
        comment: '密码',
        length: 128,
        select: false,
        nullable: false,
        transformer: { from: value => value, to: value => hashSync(value) }
    })
    password: string

    @ApiProperty({ description: '主题: 浅色模式-light、深色模式-dark', enum: EnumUserTheme })
    @IsNotEmpty({ message: '主题必填' })
    @IsEnum(EnumUserTheme, { message: '主题参数格式错误' })
    @Column({ comment: '主题: 浅色模式-light、深色模式-dark', length: 32, default: 'light', nullable: false })
    theme: string

    @ApiProperty({ description: '涂鸦背景主题色ID' })
    @IsNotEmpty({ message: '涂鸦背景主题色ID必填' })
    @Column({ comment: '涂鸦背景主题色ID', nullable: false })
    color: number

    @ApiProperty({ description: '涂鸦: true-开启、false-关闭', enum: [true, false] })
    @IsNotEmpty({ message: '涂鸦必填' })
    @Type(() => Boolean)
    @Column({ comment: '涂鸦: true-开启、false-关闭', nullable: false, default: true })
    paint: boolean

    @ApiProperty({ description: '消息通知声音: true-开启、false-关闭', enum: [true, false] })
    @IsNotEmpty({ message: '消息通知声音必填' })
    @Type(() => Boolean)
    @Column({ comment: '消息通知声音: true-开启、false-关闭', nullable: false, default: true })
    sound: boolean

    @ApiProperty({ description: '消息通知: true-开启、false-关闭', enum: [true, false] })
    @IsNotEmpty({ message: '消息通知必填' })
    @Type(() => Boolean)
    @Column({ comment: '消息通知: true-开启、false-关闭', nullable: false, default: true })
    notify: boolean

    @ApiProperty({ description: '双因子认证: true-开启、false-关闭', enum: [true, false] })
    @IsNotEmpty({ message: '双因子认证必填' })
    @Type(() => Boolean)
    @Column({ comment: '双因子认证: true-开启、false-关闭', nullable: false, default: true })
    factor: boolean

    @ApiProperty({ description: '双因子认证间隔天数' })
    @IsNotEmpty({ message: '双因子认证间隔天数必填' })
    @IsNumber({}, { message: '双因子认证间隔天数必须为数字' })
    @Min(1, { message: '双因子认证间隔不能少于1天' })
    @Max(30, { message: '双因子认证间隔不能大于30天' })
    @Column({ comment: '双因子认证间隔天数', nullable: false, default: 7 })
    limit: number
}

export class SchemaUser extends UserEntier {
    @ApiProperty({ description: '验证码', example: '495673' })
    @IsNotEmpty({ message: '验证码 必填' })
    code: string

    @ApiProperty({ description: '邮箱、手机号、UID' })
    @IsNotEmpty({ message: 'target参数必填' })
    target: string

    @ApiProperty({ description: '验证类型: 邮箱-email、手机号-phone', enum: EnumUserType })
    @IsNotEmpty({ message: '验证类型必填' })
    @IsEnum(EnumUserSource, { message: '验证类型参数格式错误' })
    type: string

    @ApiProperty({ description: '验证码类型: 注册-register、双因子认证-factor、账号标识变更-change', enum: EnumUserSource })
    @IsNotEmpty({ message: '验证码类型必填' })
    @IsEnum(EnumUserSource, { message: '验证码类型参数格式错误' })
    source: string

    @ApiProperty({ description: 'Token', example: '6oIWqrg921mcw95UAwVHZb84PEFSH******' })
    token: string

    @ApiProperty({ description: 'Token 有效时间', example: 24 * 60 * 60 })
    expire: number
}
