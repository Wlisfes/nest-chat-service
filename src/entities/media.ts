import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { CommonEntier } from '@/utils/utils-typeorm'

@Entity({ name: 'media', comment: '媒体文件表' })
export class MediaEntier extends CommonEntier {
    @ApiProperty({ description: '文件ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '文件ID必填' })
    @Column({ comment: '文件ID', nullable: false })
    fileId: string
}

export class SchemaMediaEntier extends MediaEntier {}
