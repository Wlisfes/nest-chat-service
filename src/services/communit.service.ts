import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { CustomService } from '@/services/custom.service'
import { RedisService } from '@/services/redis/redis.service'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineResolver, divineIntNumber, divineLogger, divineHandler } from '@/utils/utils-common'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class CommunitService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly custom: CustomService,
        private readonly redis: RedisService
    ) {}

    /**新建社群**/
    public async httpCommunitCreater(uid: string, scope: env.BodyCommunitCreater, headers: env.Headers) {
        try {
            return await this.custom.divineWithTransaction(async manager => {
                await this.custom.divineNoner(this.custom.tableCommunit, {
                    headers,
                    message: '社群名称已存在或被占用',
                    dispatch: {
                        where: { name: scope.name }
                    }
                })
                const user = await this.custom.divineHaver(this.custom.tableUser, {
                    headers,
                    message: '账号不存在',
                    dispatch: { where: { uid } }
                })
                const communit = await this.custom.divineCreate(this.custom.tableCommunit, {
                    headers,
                    manager: true,
                    state: {
                        uid: await divineIntNumber(),
                        name: scope.name,
                        creator: user,
                        members: [user]
                    }
                })
                return await manager.save(communit).then(async () => {
                    this.logger.info(
                        [CommunitService.name, this.httpCommunitCreater.name].join(':'),
                        divineLogger(headers, { message: '新建社群成功', name: scope.name, creator: user })
                    )
                    return await divineResolver({ message: '新建成功' })
                })
            })
        } catch (e) {
            this.logger.error(
                [CommunitService.name, this.httpCommunitCreater.name].join(':'),
                divineLogger(headers, { message: e.message, status: e.status ?? HttpStatus.INTERNAL_SERVER_ERROR })
            )
            throw new HttpException(e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
