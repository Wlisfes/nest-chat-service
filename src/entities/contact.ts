import { Entity, Column, OneToOne, JoinColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { CommonEntier } from '@/entities/common'
import { UserEntier } from '@/entities/instance'

@Entity({ name: 'contact' })
export class ContactEntier extends CommonEntier {
    @ApiProperty({ description: '绑定关系UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: 'UID必填' })
    @Column({ comment: '绑定关系UID', nullable: false })
    uid: string

    @ApiProperty({ description: '联系人状态: 删除-delete、启用-enable', enum: ['delete', 'enable'], example: 'enable' })
    @IsNotEmpty({ message: '联系人状态必填' })
    @Column({ comment: '联系人状态: 删除-delete、启用-enable', default: 'enable', nullable: false })
    status: string

    // @OneToOne(type => UserEntier)
    // @JoinColumn()
    // sender: UserEntier

    // @OneToOne(type => UserEntier)
    // @JoinColumn()
    // receive: UserEntier
}

export class SchemaContact extends ContactEntier {}
