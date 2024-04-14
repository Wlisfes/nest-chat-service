import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsEnum } from 'class-validator'
import { IsOptional } from '@/decorator/common.decorator'
import { CommonEntier } from '@/utils/utils-typeorm'

/**通知记录表: 通知类型**/
export enum EnumNotificationSource {
    contact = 'contact',
    communit = 'communit'
}

/**通知记录表: 通知状态**/
export enum EnumNotificationStatus {
    waitze = 'waitze',
    resolve = 'resolve',
    reject = 'reject'
}

@Entity({ name: 'notification' })
export class NotificationEntier extends CommonEntier {
    @ApiProperty({ description: '通知记录ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '通知记录ID必填' })
    @Column({ comment: '通知记录ID', nullable: false })
    uid: string

    @ApiProperty({ description: '通知类型: 好友申请-contact、群聊申请-communit', enum: EnumNotificationSource })
    @IsNotEmpty({ message: '通知类型必填' })
    @IsEnum(EnumNotificationSource, { message: '通知类型错误' })
    @Column({ comment: '通知类型: 好友申请-contact、群聊申请-communit', nullable: false })
    source: string

    @ApiProperty({ description: '申请用户ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '申请用户ID必填' })
    @Column({ comment: '申请用户ID', nullable: false })
    userId: string

    @ApiProperty({ description: '接收用户ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '接收用户ID必填' })
    @Column({ comment: '接收用户ID', nullable: true })
    niveId: string

    @ApiProperty({ description: '社群ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '社群ID必填' })
    @Column({ comment: '社群ID', nullable: true })
    communitId: string

    @ApiProperty({ description: '通知状态: waitze-待处理、resolve-通过、reject-拒绝', enum: EnumNotificationStatus })
    @IsNotEmpty({ message: '通知状态必填' })
    @IsEnum(EnumNotificationStatus, { message: '通知状态错误' })
    @Column({ comment: '通知状态', nullable: false })
    status: string
}

export class SchemaNotification extends NotificationEntier {}
