import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsBoolean, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'
import { CommonEntier } from '@/utils/utils-typeorm'
import * as entities from '@/entities/instance'

/**会话聊天室成员表: 成员状态**/
export enum EnumSessionMemberStatus {
    enable = 'enable',
    quit = 'quit',
    kick = 'kick'
}
/**社群成员表: 社群成员角色**/
export enum EnumSessionMemberRole {
    master = 'master',
    manager = 'manager',
    masses = 'masses'
}

@Entity({ name: 'session_member', comment: '会话聊天室成员表' })
export class SessionMemberEntier extends CommonEntier {
    @ApiProperty({ description: '会话SID' })
    @IsNotEmpty({ message: '会话SID必填' })
    @Index()
    @Column({ comment: '会话SID', length: 32, nullable: false })
    sid: string

    @ApiProperty({ description: '会话类型: 私聊-contact、群聊-communit', enum: entities.EnumSessionSource })
    @IsNotEmpty({ message: '会话类型必填' })
    @IsEnum(entities.EnumSessionSource, { message: '会话类型错误' })
    @Column({ comment: '会话类型: 私聊-contact、群聊-communit', length: 32, nullable: false })
    source: string

    @ApiProperty({ description: '联系ID' })
    @IsNotEmpty({ message: '联系ID必填' })
    @Index()
    @Column({ comment: '联系ID', length: 32, nullable: false })
    connect: string

    @ApiProperty({ description: '用户UID' })
    @IsNotEmpty({ message: '用户UID必填' })
    @Column({ comment: '用户UID', length: 32, nullable: false })
    @Index()
    userId: string

    @ApiProperty({ description: '会话聊天室成员角色: master-群主、manager-管理员、masses-群众', enum: EnumSessionMemberRole })
    @IsNotEmpty({ message: '会话聊天室成员角色' })
    @IsEnum(EnumSessionMemberRole, { message: '会话聊天室成员参数格式错误' })
    @Column({ comment: '会话聊天室成员角色', nullable: false, default: 'masses' })
    role: string

    @ApiProperty({ description: '会话聊天室成员状态: enable-启用、quit-已退出、kick-已踢出', enum: EnumSessionMemberStatus })
    @IsNotEmpty({ message: '会话聊天室成员必填' })
    @IsEnum(EnumSessionMemberStatus, { message: '会话聊天室成员参数格式错误' })
    @Column({ comment: '会话聊天室成员', nullable: false, default: 'enable' })
    status: string

    @ApiProperty({ description: '用户禁言状态: true-禁言、false-不禁言', enum: [true, false] })
    @IsNotEmpty({ message: '用户禁言状态必填' })
    @IsBoolean({ message: '用户禁言状态参数格式错误' })
    @Type(() => Boolean)
    @Column({ comment: '用户禁言状态', nullable: false, default: false })
    speak: boolean
}

export class SchemaSessionMember extends SessionMemberEntier {}
