import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsEnum } from 'class-validator'
import { CommonEntier } from '@/utils/utils-typeorm'

/**媒体文件表: 文件类型**/
export enum MediaEntierSource {
    avatar = 'avatar',
    image = 'image',
    document = 'document',
    audio = 'audio',
    video = 'video'
}

@Entity({ name: 'media', comment: '媒体文件表' })
export class MediaEntier extends CommonEntier {
    @ApiProperty({ description: '上传用户ID', example: '2149446185344106496' })
    @IsNotEmpty({ message: '上传用户ID必填' })
    @Column({ comment: '上传用户ID', nullable: false })
    userId: string

    @ApiProperty({ description: '上传类型: avatar-头像、image-图片、document-文档、audio-音频、video-视频', enum: MediaEntierSource })
    @IsNotEmpty({ message: '上传类型必填' })
    @IsEnum(MediaEntierSource, { message: '上传类型参数格式错误' })
    @Column({ comment: '上传类型: avatar-头像、image-图片、document-文档、audio-音频、video-视频', nullable: false })
    source: string

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

export class SchemaMediaEntier extends MediaEntier {
    @ApiProperty({ type: 'string', format: 'binary' })
    @IsNotEmpty({ message: 'file文件不能为空' })
    file: File
}
