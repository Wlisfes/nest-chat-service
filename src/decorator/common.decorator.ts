import { ValidateIf, registerDecorator, ValidationOptions, buildMessage, ValidateBy, ValidationArguments } from 'class-validator'

/**自定义装饰器-验证空值**/
export function IsOptional(validationOptions?: ValidationOptions, props?: { string?: boolean; number?: boolean }) {
    if (props?.number) {
        return ValidateIf((obj, value) => {
            return value !== null && value !== undefined && value !== '' && value !== 0
        }, validationOptions)
    }

    if (props?.string) {
        return ValidateIf((obj, value) => {
            return value !== null && value !== undefined && value !== ''
        }, validationOptions)
    }

    return ValidateIf((obj, value) => {
        return value !== null && value !== undefined
    }, validationOptions)
}

/**验证手机号码**/
export function isMobile(value: string) {
    return /^(?:(?:\+|00)86)?1[3-9]\d{9}$/.test(value)
}

/**自定义装饰器-验证手机号**/
export function IsMobile(validationOptions?: ValidationOptions) {
    return ValidateBy(
        {
            name: 'isMobile',
            validator: {
                validate: (value, args) => {
                    return isMobile(value)
                },
                defaultMessage: buildMessage(eachPrefix => eachPrefix + '$property must be a string', validationOptions)
            }
        },
        validationOptions
    )
}

/**自定义装饰器**/
export function IsCustomize(option: {
    validate(value: any, args: ValidationArguments): Promise<boolean> | boolean
    message(prefix: string, args: ValidationArguments): string
}) {
    return ValidateBy({
        name: 'isCustomize',
        validator: {
            validate: option.validate,
            defaultMessage: buildMessage(option.message)
        }
    })
}

/**自定义时间格式验证**/
export function IsDateCustomize(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isDateCustomize',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
                    return typeof value === 'string' && regex.test(value)
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property}必须是有效的日期时间格式：yyyy-MM-DD HH:mm:ss`
                }
            }
        })
    }
}

/**数字转化**/
export function TransferNumber({ value }) {
    if (value && Array.isArray(value)) {
        return value
    } else if (value && typeof value === 'string') {
        return value.split(',').map(k => Number(k)) || []
    } else {
        return []
    }
}
