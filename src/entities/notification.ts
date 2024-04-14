import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { IsOptional } from '@/decorator/common.decorator'
import { CommonEntier } from '@/utils/utils-typeorm'

@Entity({ name: 'notification' })
export class NotificationEntier extends CommonEntier {
    @ApiProperty({ description: '通知记录ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '通知记录ID必填' })
    @Column({ comment: '通知记录ID', nullable: false })
    uid: string

    @ApiProperty({ description: '通知类型: 好友申请-contact、群聊申请-communit', enum: ['contact', 'communit'] })
    @IsNotEmpty({ message: '通知类型必填' })
    @Column({ comment: '通知类型: 好友申请-contact、群聊申请-communit', nullable: false })
    source: string

    @ApiProperty({ description: '申请用户ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '申请用户ID必填' })
    @Column({ comment: '申请用户ID', nullable: false })
    userId: string

    @ApiProperty({ description: '接收用户ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '接收用户ID必填' })
    @Column({ comment: '接收用户ID', nullable: false })
    niveId: string

    @ApiProperty({ description: '社群ID', required: false })
    @IsOptional()
    @Column({ comment: '社群ID', nullable: true })
    communitId: string

    @ApiProperty({ description: '通知状态: waitze-待处理、resolve-通过、reject-拒绝', enum: ['waitze', 'resolve', 'reject'] })
    @IsNotEmpty({ message: '通知状态必填' })
    @Column({ comment: '通知状态', nullable: false })
    status: string
}

export class SchemaNotification extends NotificationEntier {}
