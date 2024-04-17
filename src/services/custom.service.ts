import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common'
import { Repository, EntityManager, DataSource, DeepPartial, SelectQueryBuilder } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { Logger } from 'winston'
import { JwtService } from '@nestjs/jwt'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineResolver, divineLogger } from '@/utils/utils-common'
import * as entities from '@/entities/instance'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'

export interface DivineCustomOption<T> extends env.Omix {
    message?: string
    status?: number
    expire?: number
    dispatch?: env.Omix<T>
    headers?: Partial<env.Omix<Headers>>
    cause?: env.Omix
}

@Injectable()
export class CustomService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        @InjectRepository(entities.UserEntier) public readonly tableUser: Repository<entities.UserEntier>,
        @InjectRepository(entities.MediaEntier) public readonly tableMedia: Repository<entities.MediaEntier>,
        @InjectRepository(entities.CommunitEntier) public readonly tableCommunit: Repository<entities.CommunitEntier>,
        @InjectRepository(entities.CommunitMemberEntier) public readonly tableCommunitMember: Repository<entities.CommunitMemberEntier>,
        @InjectRepository(entities.ContactEntier) public readonly tableContact: Repository<entities.ContactEntier>,
        @InjectRepository(entities.NotificationEntier) public readonly tableNotification: Repository<entities.NotificationEntier>,
        @InjectRepository(entities.SessionEntier) public readonly tableSession: Repository<entities.SessionEntier>,
        @InjectRepository(entities.MessagerEntier) public readonly tableMessager: Repository<entities.MessagerEntier>,
        @InjectRepository(entities.MessagerMediaEntier) public readonly tableMessageMediar: Repository<entities.MessagerMediaEntier>,
        @InjectRepository(entities.MessagerReadEntier) public readonly tableMessagerRead: Repository<entities.MessagerReadEntier>,
        private readonly entityManager: EntityManager,
        private readonly dataSource: DataSource,
        private readonly jwtService: JwtService
    ) {}

    /**jwtToken解析**/
    public async divineJwtTokenParser<T>(token: string, scope: DivineCustomOption<T>): Promise<T> {
        try {
            return (await this.jwtService.verifyAsync(token, { secret: web.WEB_COMMON_JWT_SECRET })) as T
        } catch (e) {
            throw new HttpException(scope.message ?? '身份验证失败', scope.status ?? HttpStatus.UNAUTHORIZED)
        }
    }

    /**jwtToken加密**/
    public async divineJwtTokenSecretr<T>(node: env.Omix<T>, scope: DivineCustomOption<T>): Promise<string> {
        try {
            if (scope.expire) {
                return await this.jwtService.signAsync(Object.assign(node, {}), {
                    expiresIn: scope.expire,
                    secret: web.WEB_COMMON_JWT_SECRET
                })
            } else {
                return await this.jwtService.signAsync(node, { secret: web.WEB_COMMON_JWT_SECRET })
            }
        } catch (e) {
            throw new HttpException(scope.message ?? '身份验证失败', scope.status ?? HttpStatus.UNAUTHORIZED)
        }
    }

    /**typeorm事务**/
    public async divineConnectTransaction<T>(start: boolean = true) {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        if (start) {
            await queryRunner.startTransaction()
        }
        return queryRunner
    }

    /**typeorm事务**/
    public async divineWithTransaction<T>(callback: (manager: EntityManager) => Promise<Partial<env.Omix<T>>>) {
        return await this.entityManager.transaction(async manager => {
            return await callback(manager)
        })
    }

    /**数据验证:不存在-抛出异常、存在-返回数据模型**/
    public async divineCatchWherer<T>(where: boolean, node: T, scope: DivineCustomOption<T>) {
        return await divineCatchWherer(where && Boolean(scope.message), {
            message: scope.message,
            cause: scope.cause,
            status: scope.status ?? HttpStatus.BAD_REQUEST
        }).then(() => node)
    }

    /**验证数据模型:不存在-抛出异常、存在-返回数据模型**/
    public async divineHaver<T>(model: Repository<T>, scope: DivineCustomOption<Parameters<typeof model.findOne>['0']>) {
        try {
            this.logger.info(
                [CustomService.name, this.divineHaver.name].join(':'),
                divineLogger(scope.headers, {
                    message: `[${model.metadata.name}]:查询入参`,
                    cause: scope.cause ?? null,
                    dispatch: scope.dispatch
                })
            )
            return await model.findOne(scope.dispatch).then(async node => {
                this.logger.info(
                    [CustomService.name, this.divineHaver.name].join(':'),
                    divineLogger(scope.headers, {
                        message: `[${model.metadata.name}]:查询出参`,
                        cause: scope.cause ?? null,
                        node
                    })
                )
                return await this.divineCatchWherer(!Boolean(node), node, scope as never)
            })
        } catch (e) {
            throw new HttpException(e.response ?? e.message, e.status)
        }
    }

    /**验证数据模型:存在-抛出异常、不存在-返回空**/
    public async divineNoner<T>(model: Repository<T>, scope: DivineCustomOption<Parameters<typeof model.findOne>['0']>) {
        try {
            this.logger.info(
                [CustomService.name, this.divineNoner.name].join(':'),
                divineLogger(scope.headers, {
                    message: `[${model.metadata.name}]:查询入参`,
                    cause: scope.cause ?? null,
                    dispatch: scope.dispatch
                })
            )
            return await model.findOne(scope.dispatch).then(async node => {
                this.logger.info(
                    [CustomService.name, this.divineHaver.name].join(':'),
                    divineLogger(scope.headers, { message: `[${model.metadata.name}]:查询出参`, cause: scope.cause ?? null, node })
                )
                return await this.divineCatchWherer(Boolean(node), node, scope as never)
            })
        } catch (e) {
            throw new HttpException(e.response ?? e.message, e.status)
        }
    }

    /**创建数据模型**/
    public async divineCreate<T>(
        model: Repository<T>,
        scope: { state: DeepPartial<T>; manager?: boolean; headers?: Partial<env.Headers> }
    ): Promise<T> {
        try {
            this.logger.info(
                [CustomService.name, this.divineCreate.name].join(':'),
                divineLogger(scope.headers, { message: `[${model.metadata.name}]:创建入参`, state: scope.state })
            )
            const state = await model.create(scope.state)
            if (scope.manager) {
                /**抛出实体由事务处理**/
                return state
            }
            return await model.save(state).then(async node => {
                this.logger.info(
                    [CustomService.name, this.divineCreate.name].join(':'),
                    divineLogger(scope.headers, { message: `[${model.metadata.name}]:创建结果`, state: scope.state, node })
                )
                return node
            })
        } catch (e) {
            throw new HttpException(e.response ?? e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**更新数据模型**/
    public async divineUpdate<T>(
        model: Repository<T>,
        scope: {
            where: Parameters<typeof model.update>['0']
            state: Parameters<typeof model.update>['1']
            headers?: Partial<env.Headers>
        }
    ) {
        try {
            this.logger.info(
                [CustomService.name, this.divineUpdate.name].join(':'),
                divineLogger(scope.headers, {
                    message: `[${model.metadata.name}]:更新入参`,
                    dispatch: scope.where,
                    state: scope.state
                })
            )
            return await model.update(scope.where, scope.state).then(node => {
                this.logger.info(
                    [CustomService.name, this.divineUpdate.name].join(':'),
                    divineLogger(scope.headers, {
                        message: `[${model.metadata.name}]:更新结果`,
                        dispatch: scope.where,
                        state: scope.state,
                        node
                    })
                )
                return node
            })
        } catch (e) {
            throw new HttpException(e.response ?? e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**分页列表查询**/
    public async divineIvanCount<T>(model: Repository<T>, scope: Parameters<typeof model.findAndCount>['0']) {
        try {
            return await model.findAndCount(scope).then(async ([list = [], total = 0]) => {
                return await divineResolver({ list, total })
            })
        } catch (e) {
            throw new HttpException(e.response ?? e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**自定义查询**/
    public async divineBuilder<T, R>(model: Repository<T>, callback: (qb: SelectQueryBuilder<T>) => Promise<R>) {
        try {
            const qb = model.createQueryBuilder('t')
            return await callback(qb)
        } catch (e) {
            throw new HttpException(e.response ?? e.message, e.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
