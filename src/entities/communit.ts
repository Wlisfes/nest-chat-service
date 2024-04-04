import { Entity, Column, OneToOne, JoinColumn, JoinTable, ManyToMany } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsArray } from 'class-validator'
import { Type } from 'class-transformer'
import { CommonEntier } from '@/entities/common'
import { UserEntier } from '@/entities/instance'

@Entity({ name: 'communit' })
export class CommunitEntier extends CommonEntier {
    @ApiProperty({ description: '社群UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: 'UID必填' })
    @Column({ comment: '唯一UUID', nullable: false })
    uid: string

    @ApiProperty({ description: '社群名称', example: '妖雨纯' })
    @IsNotEmpty({ message: '社群名称必填' })
    @Length(2, 32, { message: '社群名称必须保持2~32位' })
    @Column({ comment: '社群名称', nullable: false })
    name: string

    /**社群创建者**/
    @OneToOne(() => UserEntier, { createForeignKeyConstraints: false })
    @JoinColumn()
    creator: UserEntier

    /**社群成员列表**/
    @ManyToMany(() => UserEntier, user => user.communits)
    @JoinTable()
    members: UserEntier[]
}

export class SchemaCommunit extends CommunitEntier {
    @ApiProperty({ description: '用户UID', example: ['2149446185344106496'] })
    @IsArray({ message: '用户UID参数格式错误' })
    @Type(() => String)
    invite: string[]
}
