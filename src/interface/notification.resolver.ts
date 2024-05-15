import { ApiProperty, PickType, IntersectionType } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min, IsEnum, IsArray } from 'class-validator'
import { Type } from 'class-transformer'
import { IsOptional } from '@/decorator/common.decorator'
import * as entities from '@/entities/instance'
import * as env from '@/interface/instance.resolver'

/**更新通知状态**/
export class BodyNotificationUpdate extends PickType(entities.SchemaNotification, ['uid', 'status']) {}

/**更新好友申请通知状态**/
export class BodyNotificationContactUpdate extends PickType(entities.SchemaNotification, ['status', 'userId', 'niveId']) {
    notifyId: string
}

/**更新社群申请通知状态**/
export class BodyNotificationCommunitUpdate extends PickType(entities.SchemaNotification, ['status', 'userId', 'communitId']) {
    notifyId: string
}
