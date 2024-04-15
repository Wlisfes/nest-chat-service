import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsEnum } from 'class-validator'
import { CommonEntier } from '@/utils/utils-typeorm'

/**会话聊天记录表: 记录类型**/
export enum EnumSessionReducer {
    contact = 'contact',
    communit = 'communit'
}

@Entity({ name: 'session_reducer', comment: '会话聊天记录表' })
export class SessionReducerEntier extends CommonEntier {
    @ApiProperty({ description: '会话SID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '会话SID必填' })
    @Column({ comment: '会话SID', nullable: false })
    sessionId: string
}

export class SchemaSessionReducer extends SessionReducerEntier {}
