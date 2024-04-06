import { Entity, Column, OneToOne, JoinColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { CommonEntier } from '@/entities/common'
import { UserEntier } from '@/entities/instance'

@Entity({ name: 'notification' })
export class NotificationEntier extends CommonEntier {
    @ApiProperty({
        description: '通知类型: 好友申请-contact、群聊申请-communit',
        enum: ['contact', 'communit']
    })
    @IsNotEmpty({ message: '通知类型必填' })
    @Column({ comment: '通知类型: 好友申请-contact、群聊申请-communit', nullable: false })
    source: string
}

export class SchemaNotification extends NotificationEntier {}
