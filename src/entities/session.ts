import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsEnum } from 'class-validator'
import { CommonEntier } from '@/utils/utils-typeorm'

/**会话记录表: 会话类型**/
export enum EnumSessionSource {
    contact = 'contact',
    communit = 'communit'
}

@Entity({ name: 'session', comment: '会话聊天室表' })
export class SessionEntier extends CommonEntier {
    @ApiProperty({ description: '会话SID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '会话SID必填' })
    @Index()
    @Column({ comment: '会话SID', nullable: false })
    sid: string

    @ApiProperty({ description: '会话类型: 私聊-contact、群聊-communit', enum: EnumSessionSource })
    @IsNotEmpty({ message: '会话类型必填' })
    @IsEnum(EnumSessionSource, { message: '会话类型错误' })
    @Column({ comment: '会话类型: 私聊-contact、群聊-communit', nullable: false })
    source: string

    @ApiProperty({ description: '好友绑定关系ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '好友绑定关系ID必填' })
    @Column({ comment: '好友绑定关系ID', nullable: true })
    @Index()
    contactId: string

    @ApiProperty({ description: '社群ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '社群ID必填' })
    @Column({ comment: '社群ID', nullable: true })
    @Index()
    communitId: string

    @ApiProperty({ description: '事件监听' })
    @Column({ comment: '事件监听: true-开启、false-关闭', nullable: false, default: false })
    mounted: boolean
}

export class SchemaSession extends SessionEntier {}
