import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsArray, IsBoolean, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'
import { CommonEntier } from '@/utils/utils-typeorm'

export enum EnumCommunitStatus {
    enable = 'enable',
    dissolve = 'dissolve'
}

@Entity({ name: 'communit' })
export class CommunitEntier extends CommonEntier {
    @ApiProperty({ description: '社群ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '社群ID必填' })
    @Column({ comment: '社群ID', nullable: false })
    uid: string

    @ApiProperty({ description: '社群名称', example: '妖雨纯' })
    @IsNotEmpty({ message: '社群名称必填' })
    @Length(2, 32, { message: '社群名称必须保持2~32位' })
    @Column({ comment: '社群名称', nullable: false })
    name: string

    @ApiProperty({ description: '社群封面', example: '妖雨纯' })
    @IsNotEmpty({ message: '社群封面必填' })
    @Column({ comment: '社群封面', nullable: false })
    poster: string

    @ApiProperty({ description: '社群创建者ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '社群创建者ID必填' })
    @Column({ comment: '社群创建者ID', nullable: false })
    ownId: string

    @ApiProperty({ description: '社群状态: enable-启用、dissolve-解散', enum: EnumCommunitStatus })
    @IsNotEmpty({ message: '社群状态必填' })
    @IsEnum(EnumCommunitStatus, { message: '社群状态参数格式错误' })
    @Column({ comment: '社群状态', nullable: false, default: 'enable' })
    status: string

    @ApiProperty({ description: '社群描述' })
    @IsNotEmpty({ message: '社群描述必填' })
    @Column({ comment: '社群描述', nullable: false })
    comment: string

    @ApiProperty({ description: '社群禁言状态: true-禁言、false-不禁言', enum: [true, false] })
    @IsNotEmpty({ message: '社群禁言状态必填' })
    @IsBoolean({ message: '社群禁言状态参数格式错误' })
    @Type(() => Boolean)
    @Column({ comment: '社群禁言状态', nullable: false, default: false })
    speak: boolean
}

export class SchemaCommunit extends CommunitEntier {
    @ApiProperty({ description: '用户UID', example: ['2149446185344106496'] })
    @IsArray({ message: '用户UID参数格式错误' })
    @Type(() => String)
    invite: string[]
}
