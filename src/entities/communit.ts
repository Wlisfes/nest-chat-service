import { Entity, Column } from 'typeorm'
import { hashSync } from 'bcryptjs'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsEmail } from 'class-validator'
import { IsOptional } from '@/decorator/common.decorator'
import { CommonEntier } from '@/entities/common'

@Entity({ name: 'communit' })
export class CommunitEntier extends CommonEntier {
    @ApiProperty({ description: 'UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: 'UID必填' })
    @Column({ comment: '唯一UUID', nullable: false })
    uid: string
}
