import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CustomService } from '@/services/common/custom.service'
import { CommonService } from '@/services/common/common.service'
import { DataBaseService } from '@/services/database/database.service'
import { RedisService } from '@/services/redis/redis.service'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineResolver, divineIntNumber } from '@/utils/utils-common'
import * as web from '@/config/instance'
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
        await this.redis.getStore(`${web.WEB_REDIS_MAIL_CACHE.register}:${scope.email}`).then(async code => {
            return await divineCatchWherer(scope.code !== code, {
                message: '验证码不存在'
            })
        })
        await this.custom.divineNoner(this.dataBase.tableProfile, {
            message: '邮箱已注册',
            where: { email: scope.email }
        })
        return await this.custom.divineWithTransaction(async manager => {
            const user = this.dataBase.tableUser.create({ uid: await divineIntNumber() })
            await manager.save(user)
            const profile = await this.dataBase.tableProfile.create({
                uid: user.uid,
                email: scope.email,
                nickname: scope.nickname,
                password: scope.password,
                avatar: 'https://oss.lisfes.cn/cloud/avatar/2021-08/1628499170684.png'
            })
            await manager.save(profile)
            return await this.redis.delStore(`${web.WEB_REDIS_MAIL_CACHE.register}:${scope.email}`).then(async () => {
                return await divineResolver({ message: '注册成功' })
            })
        })
    }
}
