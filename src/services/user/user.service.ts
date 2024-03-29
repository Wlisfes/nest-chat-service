import { Injectable, Inject } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CustomService } from '@/services/common/custom.service'
import { CommonService } from '@/services/common/common.service'
import { DataBaseService } from '@/services/database/database.service'
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
    public async httpUserRegister(scope: env.BodyUserRegister) {
        try {
            this.logger.info([UserService.name, 'httpUserRegister'].join(':'), { log: scope })
            return { message: 'dsadas' }
        } catch (e) {
            console.error(e)
        }
    }
}
