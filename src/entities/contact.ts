import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { CommonEntier } from '@/utils/utils-typeorm'

@Entity({ name: 'contact' })
export class ContactEntier extends CommonEntier {
    @ApiProperty({ description: '联系人绑定关系ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '联系人绑定关系ID必填' })
    @Column({ comment: '联系人绑定关系ID', nullable: false })
    uid: string

    @ApiProperty({ description: '联系人状态: 删除-delete、启用-enable', enum: ['delete', 'enable'], example: 'enable' })
    @IsNotEmpty({ message: '联系人状态必填' })
    @Column({ comment: '联系人状态: 删除-delete、启用-enable', default: 'enable', nullable: false })
    status: string

    @ApiProperty({ description: '申请用户ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '申请用户ID必填' })
    @Column({ comment: '申请用户ID', nullable: false })
    userId: string

    @ApiProperty({ description: '接收用户ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '接收用户ID必填' })
    @Column({ comment: '接收用户ID', nullable: false })
    niveId: string
}

export class SchemaContact extends ContactEntier {}
