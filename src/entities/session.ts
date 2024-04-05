import { Entity, Column, ManyToMany, JoinTable, OneToOne, JoinColumn } from 'typeorm'
import { hashSync } from 'bcryptjs'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsEmail } from 'class-validator'
import { IsOptional } from '@/decorator/common.decorator'
import { CommonEntier } from '@/entities/common'
import { ContactEntier, CommunitEntier, UserEntier } from '@/entities/instance'

@Entity({ name: 'session' })
export class SessionEntier extends CommonEntier {
    @ApiProperty({ description: '会话SID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '会话SID必填' })
    @Column({ comment: '会话SID', nullable: false })
    sid: string

    @ApiProperty({ description: '会话类型: 私聊-private、群聊-communit', enum: ['private', 'communit'], example: 'private' })
    @IsNotEmpty({ message: '会话类型必填' })
    @Column({ comment: '会话类型: 私聊-private、群聊-communit', nullable: false })
    source: string

    /**会话绑定用户**/
    @OneToOne(type => UserEntier)
    @JoinColumn()
    creator: UserEntier

    /**私聊对话绑定联系人**/
    @OneToOne(type => ContactEntier)
    @JoinColumn()
    contact: ContactEntier

    /**群聊对话绑定社群**/
    @OneToOne(type => CommunitEntier)
    @JoinColumn()
    communit: CommunitEntier
}

export class SchemaSession extends SessionEntier {}
