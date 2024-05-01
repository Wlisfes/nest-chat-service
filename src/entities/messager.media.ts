import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { CommonEntier } from '@/utils/utils-typeorm'

@Entity({ name: 'messager_media', comment: '消息媒体文件表' })
export class MessagerMediaEntier extends CommonEntier {
    @ApiProperty({ description: '消息SID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '消息SID必填' })
    @Column({ comment: '消息SID', nullable: false })
    @Index()
    sid: string

    @ApiProperty({ description: '文件ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '文件ID必填' })
    @Column({ comment: '文件ID', nullable: false })
    @Index()
    fileId: string
}

export class SchemaMessagerMediaEntier extends MessagerMediaEntier {}
