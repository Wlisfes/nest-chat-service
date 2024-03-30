import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CustomService } from '@/services/common/custom.service'
import { CommonService } from '@/services/common/common.service'
import { DataBaseService } from '@/services/database/database.service'
import { RedisService } from '@/services/redis/redis.service'
import { divineResolver, divineLogger } from '@/utils/utils-common'
import * as env from '@/interface/instance'

@Injectable()
export class UserService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly dataBase: DataBaseService,
        private readonly custom: CustomService,
        private readonly common: CommonService,
        private readonly redis: RedisService
    ) {}

    /**注册用户**/
    public async httpUserRegister(scope: env.BodyUserRegister, headers: env.Headers) {
        // const code = await this.redis.getStore()
        // this.logger.info([UserService.name, 'httpUserRegister'].join(':'), divineLogger(headers, scope))
        // throw new HttpException('执行错误', HttpStatus.BAD_REQUEST)
        await this.custom.divineNoner(this.dataBase.tableProfile, {
            message: '邮件已注册',
            where: { email: scope.email }
        })

        return await divineResolver({ message: '注册成功' })
    }
}
