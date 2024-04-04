import { Controller, Get, Post, Body, Headers, Response } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CommunitService } from '@/services/communit.service'
import { ApiDecorator } from '@/decorator/compute.decorator'
import * as env from '@/interface/instance.resolver'

@ApiTags('社群模块')
@Controller('communit')
export class CommunitController {
    constructor(private readonly communit: CommunitService) {}

    @Post('/creater')
    @ApiDecorator({
        operation: { summary: '新建社群' },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpCommunitCreater(@Headers() headers: env.Headers) {}
}
