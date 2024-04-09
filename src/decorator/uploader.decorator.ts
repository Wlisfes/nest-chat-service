import { HttpException, HttpStatus, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator } from '@nestjs/common'
import * as env from '@/interface/instance.resolver'

/**文件类型配置**/
interface FileTypeOption extends env.CustomExceptionOption {
    fileType: RegExp
}
/**文件Size配置**/
interface FileSizeOption extends env.CustomExceptionOption {
    maxSize: number
}
type CustomOptionUploader = FileTypeOption | FileSizeOption

/**文件验证聚合**/
export function CustomUploaderValidator(rules: Array<CustomOptionUploader> = []) {
    const pipes = rules.map(rule => {
        if ('fileType' in rule) {
            return new ParseFilePipe({
                validators: [new FileTypeValidator({ fileType: rule.fileType })],
                exceptionFactory: error => new HttpException(rule.message, rule.status ?? HttpStatus.BAD_REQUEST)
            })
        } else if ('maxSize' in rule) {
            return new ParseFilePipe({
                validators: [new MaxFileSizeValidator({ maxSize: rule.maxSize })],
                errorHttpStatusCode: HttpStatus.BAD_REQUEST,
                exceptionFactory: error => new HttpException(rule.message, rule.status ?? HttpStatus.BAD_REQUEST)
            })
        }
        return null
    })
    return pipes.filter(Boolean)
}
