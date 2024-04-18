import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsEnum } from 'class-validator'
import { IsOptional } from '@/decorator/common.decorator'
import { CommonEntier } from '@/utils/utils-typeorm'

/**消息表: 记录类型**/
export enum EnumMessager {
    contact = 'contact',
    communit = 'communit'
}

/**消息表: 消息类型**/
export enum EnumMessagerSource {
    text = 'text', //文本
    image = 'image', //图片
    audio = 'audio', //音频
    video = 'video', //视频
    document = 'document' //文档
}

/**消息表: 消息状态**/
export enum EnumMessagerStatus {
    sending = 'sending', //发送中
    delivered = 'delivered', //发送成功
    failed = 'failed', //发送失败
    deleted = 'deleted' //删除
}

/**消息表: 消息来源**/
export enum EnumMessagerReferrer {
    socket = 'socket',
    http = 'http'
}

@Entity({ name: 'messager', comment: '消息表' })
export class MessagerEntier extends CommonEntier {
    @ApiProperty({ description: '消息SID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '消息SID必填' })
    @Column({ comment: '消息SID', nullable: false })
    sid: string

    @ApiProperty({ description: '会话SID', example: '2155687887377530880' })
    @IsNotEmpty({ message: '会话SID必填' })
    @Column({ comment: '会话SID', nullable: false })
    sessionId: string

    @ApiProperty({ description: '消息发送用户UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '消息发送用户UID必填' })
    @Column({ comment: '消息发送用户UID', nullable: false })
    userId: string

    @ApiProperty({ description: '好友绑定关系ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '好友绑定关系ID必填' })
    @Column({ comment: '好友绑定关系ID', nullable: true })
    contactId: string

    @ApiProperty({ description: '社群ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '社群ID必填' })
    @Column({ comment: '社群ID', nullable: true })
    communitId: string

    @ApiProperty({ description: '文本内容', required: false })
    @IsOptional({ message: '文本内容' })
    @Column({ comment: '文本内容', nullable: true })
    text: string

    @ApiProperty({
        description: '消息类型: text-文本、image-图片、voice-语音、video-视频、document-文档',
        enum: EnumMessagerSource
    })
    @IsNotEmpty({ message: '消息类型必填' })
    @IsEnum(EnumMessagerSource, { message: '消息类型参数格式错误' })
    @Column({ comment: '消息类型: text-文本、image-图片、voice-语音、video-视频、document-文档', nullable: false })
    source: string

    @ApiProperty({
        description: '消息状态: sending-发送中、delivered-发送成功、failed-发送失败、deleted-删除',
        enum: EnumMessagerStatus
    })
    @IsNotEmpty({ message: '消息状态必填' })
    @IsEnum(EnumMessagerStatus, { message: '消息状态参数格式错误' })
    @Column({
        comment: '消息状态: sending-发送中、delivered-发送成功、failed-发送失败、deleted-删除',
        nullable: false,
        default: 'sending'
    })
    status: string

    @ApiProperty({ description: '失败原因', required: false })
    @IsOptional({ message: '失败原因' })
    @Column({ comment: '失败原因', nullable: true })
    reason: string

    @ApiProperty({ description: '消息来源: socket、http', enum: EnumMessagerReferrer })
    @IsNotEmpty({ message: '消息来源必填' })
    @IsEnum(EnumMessagerReferrer, { message: '消息来源参数格式错误' })
    @Column({ comment: '消息来源: socket、http', nullable: false, default: 'http' })
    referrer: string
}

export class SchemaMessagerEntier extends MessagerEntier {
    @ApiProperty({ description: '文件ID', required: false })
    @IsOptional({ message: '文件ID' })
    fileId: string
}
