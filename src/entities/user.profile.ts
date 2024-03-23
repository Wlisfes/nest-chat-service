import { Entity, Column } from 'typeorm'
import { hashSync } from 'bcryptjs'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsEmail } from 'class-validator'
import { CommonEntier } from '@/entities/common'

@Entity({ name: 'user_profile' })
export class UserProfileEntier extends CommonEntier {
    @ApiProperty({ description: 'UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: 'UID 必填' })
    @Column({ comment: '唯一UUID', nullable: false })
    uid: string

    @ApiProperty({ description: '昵称', example: '妖雨纯' })
    @IsNotEmpty({ message: '昵称 必填' })
    @Column({ comment: '昵称', nullable: false })
    nickname: string

    @ApiProperty({ description: '头像' })
    @IsNotEmpty({ message: '头像 必填' })
    @Column({ comment: '头像', nullable: false })
    avatar: string

    @ApiProperty({ description: '邮箱', example: 'ucop8dd096@foxmail.com' })
    @IsNotEmpty({ message: '邮箱 必填' })
    @IsEmail({}, { message: '邮箱 格式错误' })
    @Column({ comment: '邮箱', nullable: false })
    email: string

    @ApiProperty({ description: '密码', example: 'MTIzNDU2' })
    @IsNotEmpty({ message: '密码 必填' })
    @Length(6, 32, { message: '密码格式错误' })
    @Column({
        comment: '密码',
        select: false,
        nullable: false,
        transformer: { from: value => value, to: value => hashSync(value) }
    })
    password: string
}
