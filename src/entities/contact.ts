import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsEnum } from 'class-validator'
import { CommonEntier } from '@/utils/utils-typeorm'

/**好友记录表: 好友状态**/
export enum EnumContactStatus {
    delete = 'delete',
    enable = 'enable'
}

@Entity({ name: 'contact', comment: '好友记录表' })
export class ContactEntier extends CommonEntier {
    @ApiProperty({ description: '好友绑定关系ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '好友绑定关系ID必填' })
    @Column({ comment: '好友绑定关系ID', nullable: false })
    uid: string

    @ApiProperty({ description: '好友状态: 删除-delete、启用-enable', enum: EnumContactStatus })
    @IsNotEmpty({ message: '好友状态必填' })
    @IsEnum(EnumContactStatus, { message: '好友状态参数格式错误' })
    @Column({ comment: '好友状态: 删除-delete、启用-enable', default: 'enable', nullable: false })
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
