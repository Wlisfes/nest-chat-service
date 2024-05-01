import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsBoolean, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'
import { CommonEntier } from '@/utils/utils-typeorm'

/**社群记录表: 社群状态**/
export enum EnumCommunitStatus {
    enable = 'enable',
    dissolve = 'dissolve'
}

@Entity({ name: 'communit', comment: '社群记录表' })
export class CommunitEntier extends CommonEntier {
    @ApiProperty({ description: '社群ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '社群ID必填' })
    @Column({ comment: '社群ID', nullable: false })
    @Index()
    uid: string

    @ApiProperty({ description: '社群名称' })
    @IsNotEmpty({ message: '社群名称必填' })
    @Length(2, 32, { message: '社群名称必须保持2~32字符' })
    @Column({ comment: '社群名称', nullable: false })
    name: string

    @ApiProperty({ description: '社群封面' })
    @IsNotEmpty({ message: '社群封面必填' })
    @Column({ comment: '社群封面', length: 512, nullable: false })
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
    @Length(4, 200, { message: '社群描述必须保持4~200字符' })
    @Column({ comment: '社群描述', nullable: false })
    comment: string

    @ApiProperty({ description: '社群禁言状态: true-禁言、false-不禁言', enum: [true, false] })
    @IsNotEmpty({ message: '社群禁言状态必填' })
    @IsBoolean({ message: '社群禁言状态参数格式错误' })
    @Type(() => Boolean)
    @Column({ comment: '社群禁言状态', nullable: false, default: false })
    speak: boolean
}

export class SchemaCommunit extends CommunitEntier {}
