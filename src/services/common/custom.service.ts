import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { Repository, EntityManager, DeepPartial, SelectQueryBuilder } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import { divineCatchWherer } from '@/utils/utils-plugin'
import { divineResolver } from '@/utils/utils-common'
import * as web from '@/config/instance.config'
import * as env from '@/interface/instance.resolver'

@Injectable()
export class CustomService {
    constructor(private readonly entityManager: EntityManager, private readonly jwtService: JwtService) {}

    /**jwtToken解析**/
    public async divineJwtTokenParser<T>(token: string, scope: Partial<env.Omix<{ message: string; status: number }>>): Promise<T> {
        try {
            return (await this.jwtService.verifyAsync(token, { secret: web.WEB_COMMON_JWT_SECRET })) as T
        } catch (e) {
            throw new HttpException(scope.message ?? '身份验证失败', scope.status ?? HttpStatus.UNAUTHORIZED)
        }
    }

    /**jwtToken加密**/
    public async divineJwtTokenSecretr<T>(
        node: env.Omix<T>,
        scope: Partial<env.Omix<{ message: string; status: number; expire: number }>> = {}
    ): Promise<string> {
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
            console.log(e)
            throw new HttpException(scope.message ?? '身份验证失败', scope.status ?? HttpStatus.UNAUTHORIZED)
        }
    }

    /**typeorm事务**/
    public async divineWithTransaction<T>(callback: (manager: EntityManager) => Promise<Partial<env.Omix<T>>>) {
        return await this.entityManager.transaction(async manager => {
            return await callback(manager)
        })
    }

    /**数据验证:不存在-抛出异常、存在-返回数据模型**/
    public async divineCheckr<T>(where: boolean, node: T, scope: Partial<env.Omix<{ message: string; status: number }>>) {
        return await divineCatchWherer(where && Boolean(scope.message), {
            message: scope.message,
            status: scope.status ?? HttpStatus.BAD_REQUEST
        }).then(() => node)
    }

    /**验证数据模型:不存在-抛出异常、存在-返回数据模型**/
    public async divineHaver<T>(
        model: Repository<T>,
        scope: Parameters<typeof model.findOne>['0'] & Partial<env.Omix<{ message: string; status: number }>>
    ) {
        try {
            return await model.findOne(scope).then(async node => {
                return await this.divineCheckr(!Boolean(node), node, scope)
            })
        } catch (e) {
            throw new HttpException(e.message, e.status)
        }
    }

    /**验证数据模型:存在-抛出异常、不存在-返回空**/
    public async divineNoner<T>(
        model: Repository<T>,
        scope: Parameters<typeof model.findOne>['0'] & Partial<env.Omix<{ message: string; status: number }>>
    ) {
        try {
            return await model.findOne(scope).then(async node => {
                return await this.divineCheckr(Boolean(node), node, scope)
            })
        } catch (e) {
            throw new HttpException(e.message, e.status)
        }
    }

    /**创建数据模型**/
    public async divineCreate<T>(model: Repository<T>, scope: DeepPartial<T>): Promise<T> {
        try {
            const node = await model.create(scope)
            return model.save(node)
        } catch (e) {
            throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**更新数据模型**/
    public async divineUpdate<T>(
        model: Repository<T>,
        scope: { where: Parameters<typeof model.update>['0']; state: Parameters<typeof model.update>['1'] }
    ) {
        try {
            return await model.update(scope.where, scope.state)
        } catch (e) {
            throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**分页列表查询**/
    public async divineIvanCount<T>(model: Repository<T>, scope: Parameters<typeof model.findAndCount>['0']) {
        try {
            return await model.findAndCount(scope).then(async ([list = [], total = 0]) => {
                return await divineResolver({ list, total })
            })
        } catch (e) {
            throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    /**自定义查询**/
    public async divineBuilder<T, R>(model: Repository<T>, callback: (qb: SelectQueryBuilder<T>) => Promise<R>) {
        try {
            const qb = model.createQueryBuilder('t')
            return await callback(qb)
        } catch (e) {
            throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
