import { Entity, Column } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length, IsHexColor } from 'class-validator'
import { CommonEntier } from '@/utils/utils-typeorm'

@Entity({ name: 'wallpaper', comment: '涂鸦背景主题色表' })
export class WallpaperEntier extends CommonEntier {
    @ApiProperty({ description: 'waid' })
    @IsNotEmpty({ message: 'WAID必填' })
    @Column({ comment: 'WAID', length: 32, nullable: false })
    waid: string

    @ApiProperty({ description: '浅色模式颜色' })
    @IsNotEmpty({ message: '浅色模式颜色必填' })
    @IsHexColor({ message: '浅色模式颜色必须为16进制颜色' })
    @Length(4, 32, { message: '浅色模式颜色必须保持3~32位' })
    @Column({ comment: '浅色模式颜色', nullable: false })
    light: string

    @ApiProperty({ description: '深色模式颜色' })
    @IsNotEmpty({ message: '深色模式颜色必填' })
    @IsHexColor({ message: '深色模式颜色必须为16进制颜色' })
    @Length(4, 32, { message: '深色模式颜色必须保持3~32位' })
    @Column({ comment: '深色模式颜色', nullable: false })
    dark: string
}

export class SchemaWallpaperEntier extends WallpaperEntier {}
