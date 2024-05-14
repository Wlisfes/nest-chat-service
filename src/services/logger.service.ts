import { Injectable, Inject, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger as WinstonLogger } from 'winston'
import { divineLogger } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'

class NestLogger {
    constructor(protected readonly logger: WinstonLogger, protected readonly className: string, protected readonly FnName: string) {}
    info(headers: env.Headers, args: env.Omix) {
        this.logger.info([this.className, this.FnName].join(':'), divineLogger(headers, args))
    }
    error(headers: env.Headers, args: env.Omix) {
        this.logger.error(
            [this.className, this.FnName].join(':'),
            divineLogger(headers, {
                message: args.message,
                status: args.status ?? HttpStatus.INTERNAL_SERVER_ERROR
            })
        )
    }
}

export function Logger(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
        const headers = args[0]
        this.logger = new NestLogger(this.loggerService, this.constructor.name, propertyName)
        try {
            const result = originalMethod.apply(this, args)
            if (result && typeof result.then === 'function' && typeof result.catch === 'function') {
                result.catch(err => {
                    this.logger.error(headers, {
                        message: err.message,
                        status: err.status ?? HttpStatus.INTERNAL_SERVER_ERROR
                    })
                })
            }
            return result
        } catch (err) {
            this.logger.error(headers, {
                message: err.message,
                status: err.status ?? HttpStatus.INTERNAL_SERVER_ERROR
            })
        }
    }
}

@Injectable()
export class LoggerService {
    protected readonly logger: NestLogger
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly loggerService: Logger
}
