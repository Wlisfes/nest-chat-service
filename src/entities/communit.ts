import { Entity, Column, OneToOne, JoinColumn, JoinTable, ManyToMany } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsArray } from 'class-validator'
import { Type } from 'class-transformer'
import { CommonEntier } from '@/utils/utils-typeorm'

@Entity({ name: 'communit' })
export class CommunitEntier extends CommonEntier {
    @ApiProperty({ description: '社群ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '社群ID必填' })
    @Column({ comment: '社群ID', nullable: false })
    csid: string

    @ApiProperty({ description: '社群名称', example: '妖雨纯' })
    @IsNotEmpty({ message: '社群名称必填' })
    @Length(2, 32, { message: '社群名称必须保持2~32位' })
    @Column({ comment: '社群名称', nullable: false })
    name: string

    @ApiProperty({ description: '社群封面', example: '妖雨纯' })
    @IsNotEmpty({ message: '社群封面必填' })
    @Column({ comment: '社群封面', nullable: false })
    poster: string

    // /**社群创建者**/
    // @OneToOne(() => UserEntier, { createForeignKeyConstraints: false })
    // @JoinColumn()
    // creator: UserEntier
}

export class SchemaCommunit extends CommunitEntier {
    @ApiProperty({ description: '用户UID', example: ['2149446185344106496'] })
    @IsArray({ message: '用户UID参数格式错误' })
    @Type(() => String)
    invite: string[]
}
