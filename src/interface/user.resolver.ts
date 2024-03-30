import { ApiProperty, PickType, IntersectionType } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'
import { IsOptional } from '@/decorator/common.decorator'
import * as entities from '@/entities/instance'
import * as env from '@/interface/instance'

export class BodyUserRegister extends IntersectionType(
    PickType(entities.SchemaUser, ['code']),
    PickType(entities.SchemaProfile, ['nickname', 'email', 'password'])
) {}

export class BodyUserAuthorizer extends IntersectionType(
    PickType(entities.SchemaUser, ['code']),
    PickType(entities.SchemaProfile, ['email', 'password'])
) {}
