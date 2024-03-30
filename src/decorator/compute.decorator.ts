import { ApiOperationOptions, ApiResponseOptions, getSchemaPath, ApiExtraModels } from '@nestjs/swagger'
import { ApiOperation, ApiConsumes, ApiProduces, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { applyDecorators, Type } from '@nestjs/common'
import { ApiGuardBearer } from '@/guards/auth.guard'
import * as web from '@/config/instance'

export interface OptionDecorator {
    operation: ApiOperationOptions
    response: ApiResponseOptions
    customize: { status: number; description: string; type: Type<unknown> }
    authorize: { check: boolean; next: boolean; baseURL?: boolean }
    consumes: string[]
    produces: string[]
}

export function ApiDecorator(option: Partial<OptionDecorator> = {}) {
    const consumes = option.consumes ?? ['application/x-www-form-urlencoded', 'application/json']
    const produces = option.produces ?? ['application/json', 'application/xml']
    const decorator: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
        ApiOperation(option.operation),
        ApiConsumes(...consumes),
        ApiProduces(...produces)
    ]

    if (option.customize) {
        decorator.push(
            ApiExtraModels(option.customize.type),
            ApiResponse({
                status: option.customize.status,
                description: option.customize.description,
                schema: {
                    allOf: [
                        {
                            properties: {
                                page: { type: 'number', default: 1 },
                                size: { type: 'number', default: 10 },
                                total: { type: 'number', default: 0 },
                                list: {
                                    type: 'array',
                                    items: { $ref: getSchemaPath(option.customize.type) }
                                }
                            }
                        }
                    ]
                }
            })
        )
    } else {
        decorator.push(ApiResponse(option.response))
    }

    /**开启登录验证**/
    if (option.authorize && option.authorize.check) {
        decorator.push(ApiBearerAuth(web.WEB_COMMON_HEADER_AUTHORIZE), ApiGuardBearer(option.authorize))
    }

    return applyDecorators(...decorator)
}
