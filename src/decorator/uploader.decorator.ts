import { HttpException, HttpStatus, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator } from '@nestjs/common'
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common'
import * as env from '@/interface/instance.resolver'

/**文件类型配置**/
export interface CustomizeUploadOption {
    // fileType: RegExp
    // maxSize: number
    // message: string
    // status?: number
}

/**自定义文件验证**/
export class CustomizeEnumUploadValidator implements PipeTransform {
    constructor(private readonly rules: Array<CustomizeUploadOption> = []) {}

    transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
        console.log({ file })
        return true
    }
}

// export function CustomizeUploadValidator(scope: FileTypeOption | FileSizeOption) {
//     if ('fileType' in scope) {
//         return new ParseFilePipe({
//             validators: [new FileTypeValidator({ fileType: scope.fileType })],
//             exceptionFactory: error => new HttpException(scope.message, scope.status ?? HttpStatus.BAD_REQUEST)
//         })
//     } else if ('maxSize' in scope) {
//         return new ParseFilePipe({
//             validators: [new MaxFileSizeValidator({ maxSize: scope.maxSize })],
//             errorHttpStatusCode: HttpStatus.BAD_REQUEST,
//             exceptionFactory: error => new HttpException(scope.message, scope.status ?? HttpStatus.BAD_REQUEST)
//         })
//     }
//     return undefined
// }
