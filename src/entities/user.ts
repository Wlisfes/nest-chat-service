import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { CommonEntier } from '@/entities/common'

@Entity({ name: 'user' })
export class UserEntier extends CommonEntier {
    @ApiProperty({ description: 'UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: 'UID 必填' })
    @Column({ comment: '唯一UUID', nullable: false })
    uid: string

    @ApiProperty({ description: '状态: 禁用-disable、启用-enable', enum: ['disable', 'enable'], example: 'enable' })
    @IsNotEmpty({ message: '状态 必填' })
    @Column({ comment: '状态: 禁用-disable、启用-enable', default: 'enable', nullable: false })
    status: string
}

export class SchemaUser extends UserEntier {
    @ApiProperty({ description: '验证码', example: '495673' })
    @IsNotEmpty({ message: '验证码 必填' })
    code: string
}
