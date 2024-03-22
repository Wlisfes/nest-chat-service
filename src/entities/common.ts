import { PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { moment } from '@/utils/utils-common'

export class CommonEntier {
    @ApiProperty({ description: '主键ID', example: 1 })
    @IsNotEmpty({ message: 'UID 主键ID' })
    @PrimaryGeneratedColumn({ comment: '自增长主键' })
    keyId: number

    @ApiProperty({ description: 'UID', example: '2149446185344106496' })
    @IsNotEmpty({ message: 'UID 必填' })
    @Column({ comment: '唯一UUID', nullable: false })
    uid: string

    @ApiProperty({ description: '创建时间', example: '2023-10-26 16:03:38' })
    @CreateDateColumn({
        comment: '创建时间',
        update: false,
        transformer: {
            from: value => moment(value).format('YYYY-MM-DD HH:mm:ss'),
            to: value => value
        }
    })
    createTime: Date

    @ApiProperty({ description: '更新时间', example: '2023-10-26 16:03:38' })
    @UpdateDateColumn({
        comment: '更新时间',
        transformer: {
            from: value => moment(value).format('YYYY-MM-DD HH:mm:ss'),
            to: value => value
        }
    })
    updateTime: Date
}
