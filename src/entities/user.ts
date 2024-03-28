import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { CommonEntier } from '@/entities/common'

@Entity({ name: 'user' })
export class UserEntier extends CommonEntier {
    @ApiProperty({ description: '状态: 禁用-disable、启用-enable', enum: ['disable', 'enable'], example: 'enable' })
    @IsNotEmpty({ message: '状态 必填' })
    @Column({ comment: '状态: 禁用-disable、启用-enable', default: 'enable', nullable: false })
    status: string
}
