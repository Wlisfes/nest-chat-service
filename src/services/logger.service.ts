import { Injectable, Inject, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger as WinstonLogger } from 'winston'
import { divineLogger } from '@/utils/utils-common'
import * as env from '@/interface/instance.resolver'
export { WinstonLogger, WINSTON_MODULE_PROVIDER }

export class NestLogger {
    constructor(
        protected readonly logger: WinstonLogger,
        protected readonly loggerOption: {
            headers: env.Headers
            className: string
            propertyName: string
        }
    ) {}
    log(headers: env.Headers, args: env.Omix) {
        const { className, propertyName } = this.loggerOption
        this.logger.info([className, propertyName].join(':'), divineLogger(headers, args))
    }
    info(args: env.Omix) {
        const { headers, className, propertyName } = this.loggerOption
        this.logger.info([className, propertyName].join(':'), divineLogger(headers, args))
    }
    error(args: env.Omix) {
        const { headers, className, propertyName } = this.loggerOption
        this.logger.error(
            [className, propertyName].join(':'),
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
        this.logger = new NestLogger(this.loggerService, {
            headers: args[0],
            className: this.constructor.name,
            propertyName: propertyName
        })
        try {
            const result = originalMethod.apply(this, args)
            if (result && typeof result.then === 'function' && typeof result.catch === 'function') {
                result.catch(err => {
                    this.logger.error({
                        message: err.message,
                        status: err.status ?? HttpStatus.INTERNAL_SERVER_ERROR
                    })
                })
            }
            return result
        } catch (err) {
            this.logger.error({
                message: err.message,
                status: err.status ?? HttpStatus.INTERNAL_SERVER_ERROR
            })
        }
    }
}

@Injectable()
export class LoggerService {
    protected readonly logger: NestLogger
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly loggerService: WinstonLogger
}
