import { ApiProperty, PickType, IntersectionType } from '@nestjs/swagger'
import { IsOptional } from '@/decorator/common.decorator'
import * as entities from '@/entities/instance'
import * as env from '@/interface/instance.resolver'

/**新建社群**/
export class BodyCommunitCreater extends PickType(entities.SchemaCommunit, ['name', 'poster', 'comment']) {}

/**申请加入社群**/
export class BodyCommunitInviteJoiner extends IntersectionType(
    PickType(entities.SchemaCommunit, ['uid']),
    PickType(entities.SchemaNotification, ['comment'])
) {}

export class BodyCommunitSearch {
    @ApiProperty({ description: 'UID/社群名称', required: false })
    @IsOptional()
    keyword: string
}

/**社群详情**/
export class QueryCommunitResolver extends PickType(entities.SchemaCommunit, ['uid']) {}
