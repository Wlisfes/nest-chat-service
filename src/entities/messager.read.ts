import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { CommonEntier } from '@/utils/utils-typeorm'

@Entity({ name: 'messager_read', comment: '消息读取用户表' })
export class MessagerReadEntier extends CommonEntier {
    @ApiProperty({ description: '消息SID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '消息SID必填' })
    @Column({ comment: '消息SID', nullable: false })
    sid: string

    @ApiProperty({ description: '用户UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '用户UID必填' })
    @Column({ comment: '用户UID', nullable: false })
    userId: string
}

export class SchemaMessagerReadEntier extends MessagerReadEntier {}
