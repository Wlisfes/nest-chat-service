import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CustomService } from '@/services/common/custom.service'
import { CommonService } from '@/services/common/common.service'
import { DataBaseService } from '@/services/database/database.service'
import { divineLogger } from '@/utils/utils-common'
import { APP_HEADER_REQUESTID } from '@/config/web-common.config'
import * as env from '@/interface/instance'

@Injectable()
export class UserService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly common: CommonService,
        private readonly custom: CustomService,
        private readonly dataBase: DataBaseService
    ) {}

    /**注册用户**/
    public async httpUserRegister(scope: env.BodyUserRegister, headers: env.Headers) {
        this.logger.info([UserService.name, 'httpUserRegister'].join(':'), divineLogger(headers, scope))
        // throw new HttpException('执行错误', HttpStatus.BAD_REQUEST)

        return { msg: 'dasdasd' }
    }
}
