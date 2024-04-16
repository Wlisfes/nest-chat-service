import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { CommonEntier } from '@/utils/utils-typeorm'

@Entity({ name: 'media', comment: '媒体文件表' })
export class MediaEntier extends CommonEntier {
    @ApiProperty({ description: '上传用户ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '上传用户ID必填' })
    @Column({ comment: '上传用户ID', nullable: false })
    userId: string

    @ApiProperty({ description: '文件ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '文件ID必填' })
    @Column({ comment: '文件ID', nullable: false })
    fileId: string

    @ApiProperty({ description: '文件原始名称' })
    @IsNotEmpty({ message: '文件原始名称必填' })
    @Column({ comment: '文件原始名称', nullable: false })
    fileName: string

    @ApiProperty({ description: '文件重命名' })
    @IsNotEmpty({ message: '文件重命名必填' })
    @Column({ comment: '文件重命名', nullable: false })
    fieldName: string

    @ApiProperty({ description: '文件大小' })
    @IsNotEmpty({ message: '文件大小必填' })
    @Column({ comment: '文件大小', nullable: false })
    fileSize: number

    @ApiProperty({ description: '文件存储路径' })
    @IsNotEmpty({ message: '文件存储路径必填' })
    @Column({ comment: '文件存储路径', nullable: false })
    folder: string

    @ApiProperty({ description: '文件完整路径' })
    @IsNotEmpty({ message: '文件完整路径必填' })
    @Column({ comment: '文件完整路径', nullable: false })
    fileURL: string

    @ApiProperty({ description: '文件宽度' })
    @IsNotEmpty({ message: '文件宽度必填' })
    @Column({ comment: '文件宽度', nullable: true, default: 0 })
    width: number

    @ApiProperty({ description: '文件高度' })
    @IsNotEmpty({ message: '文件高度必填' })
    @Column({ comment: '文件高度', nullable: true, default: 0 })
    height: number
}

export class SchemaMediaEntier extends MediaEntier {}
