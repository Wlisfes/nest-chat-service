import { Entity, Column, ManyToMany, JoinTable, OneToOne, JoinColumn, OneToMany } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { CommonEntier } from '@/entities/common'
import { UserEntier, CommunitEntier } from '@/entities/instance'

@Entity({ name: 'contact' })
export class ContactEntier extends CommonEntier {
    @ApiProperty({ description: '用户UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '用户UID必填' })
    @Column({ comment: '用户UID', nullable: false })
    uid: string

    @ApiProperty({ description: '联系人状态: 删除-delete、启用-enable', enum: ['delete', 'enable'], example: 'enable' })
    @IsNotEmpty({ message: '联系人状态必填' })
    @Column({ comment: '联系人状态: 删除-delete、启用-enable', default: 'enable', nullable: false })
    status: string

    /**两个对应的账号**/
    @OneToMany(type => UserEntier, user => user)
    members: UserEntier[]
}
