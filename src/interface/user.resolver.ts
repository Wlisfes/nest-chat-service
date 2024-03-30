import { ApiProperty, PickType, IntersectionType } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'
import { IsOptional } from '@/decorator/common.decorator'
import * as entities from '@/entities/instance'
import * as env from '@/interface/instance'

export class BodyUserRegister extends PickType(entities.SchemaUser, ['nickname', 'email', 'password', 'code']) {}

export class BodyUserAuthorizer extends PickType(entities.SchemaUser, ['email', 'password', 'code']) {}

export class RestUserAuthorizer extends PickType(entities.SchemaUser, ['token', 'expire']) {}

export class RestUserResolver extends entities.UserEntier {}
