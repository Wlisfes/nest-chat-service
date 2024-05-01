import { Entity, Column, Index } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsBoolean, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'
import { CommonEntier } from '@/utils/utils-typeorm'

/**社群成员表: 社群成员状态**/
export enum EnumCommunitMemberStatus {
    enable = 'enable',
    quit = 'quit',
    kick = 'kick'
}
/**社群成员表: 社群成员角色**/
export enum EnumCommunitMemberRole {
    master = 'master',
    manager = 'manager',
    masses = 'masses'
}

@Entity({ name: 'communit_member', comment: '社群成员表' })
export class CommunitMemberEntier extends CommonEntier {
    @ApiProperty({ description: '社群ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '社群ID必填' })
    @Column({ comment: '社群ID', nullable: true })
    @Index()
    communitId: string

    @ApiProperty({ description: '用户UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '用户UID必填' })
    @Column({ comment: '用户UID', nullable: false })
    @Index()
    userId: string

    @ApiProperty({ description: '社群成员角色: master-群主、manager-管理员、masses-群众', enum: EnumCommunitMemberRole })
    @IsNotEmpty({ message: '社群成员角色' })
    @IsEnum(EnumCommunitMemberRole, { message: '社群成员角色参数格式错误' })
    @Column({ comment: '社群成员角色', nullable: false, default: 'masses' })
    role: string

    @ApiProperty({ description: '社群成员状态: enable-启用、quit-已退出、kick-已踢出', enum: EnumCommunitMemberStatus })
    @IsNotEmpty({ message: '社群成员状态' })
    @IsEnum(EnumCommunitMemberStatus, { message: '社群成员状态参数格式错误' })
    @Column({ comment: '社群成员状态', nullable: false, default: 'enable' })
    status: string

    @ApiProperty({ description: '用户禁言状态: true-禁言、false-不禁言', enum: [true, false] })
    @IsNotEmpty({ message: '用户禁言状态必填' })
    @IsBoolean({ message: '用户禁言状态参数格式错误' })
    @Type(() => Boolean)
    @Column({ comment: '用户禁言状态', nullable: false, default: false })
    speak: boolean
}

export class SchemaCommunitMember extends CommunitMemberEntier {}
