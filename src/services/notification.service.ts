import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { NodemailerService } from '@/services/nodemailer/nodemailer.service'
import { RedisService } from '@/services/redis/redis.service'
import { CustomService } from '@/services/custom.service'
import { divineResolver, divineIntNumber, divineHandler, divineLogger } from '@/utils/utils-common'
import { divineGrapher } from '@/utils/utils-plugin'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class NotificationService {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger, private readonly custom: CustomService) {}
}
