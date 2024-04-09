import { HttpException, HttpStatus, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator } from '@nestjs/common'

/**文件类型配置**/
export interface FileTypeOption {
    fileType: RegExp
    message: string
    status?: number
}
/**文件Size配置**/
export interface FileSizeOption extends Pick<FileTypeOption, 'message' | 'status'> {
    maxSize: number
}

/**自定义文件验证**/
export function CustomCheckUploader(scope: FileTypeOption | FileSizeOption) {
    if ('fileType' in scope) {
        return new ParseFilePipe({
            validators: [new FileTypeValidator({ fileType: scope.fileType })],
            exceptionFactory: error => new HttpException(scope.message, scope.status ?? HttpStatus.BAD_REQUEST)
        })
    } else if ('maxSize' in scope) {
        return new ParseFilePipe({
            validators: [new MaxFileSizeValidator({ maxSize: scope.maxSize })],
            errorHttpStatusCode: HttpStatus.BAD_REQUEST,
            exceptionFactory: error => new HttpException(scope.message, scope.status ?? HttpStatus.BAD_REQUEST)
        })
    }
    return undefined
}
