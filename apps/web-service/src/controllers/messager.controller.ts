import { Controller, Get, Post, Body, Query, Headers, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { MessagerService } from '@/services/messager.service'
import { ApiDecorator } from '@/decorator/compute.decorator'
import * as env from '@/interface/instance.resolver'
import * as entities from '@/entities/instance'

@ApiTags('消息模块')
@Controller('messager')
export class MessagerController {
    constructor(private readonly messagerService: MessagerService) {}

    @Post('/customize/transmitter')
    @ApiDecorator({
        operation: { summary: '发送自定义消息' },
        authorize: { check: true, next: false },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpCustomizeMessagerTransmitter(
        @Headers() headers: env.Headers,
        @Request() request: env.Omix<{ user: env.RestUserResolver }>,
        @Body() body: env.BodyCheckCustomizeMessager
    ) {
        return await this.messagerService.httpCommonCustomizeMessager(headers, request.user.uid, {
            ...body,
            referrer: entities.EnumMessagerReferrer.http
        })
    }

    @Get('/session/column')
    @ApiDecorator({
        operation: { summary: '会话消息列表' },
        authorize: { check: true, next: false },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpSessionColumnMessager(
        @Headers() headers: env.Headers,
        @Request() request: env.Omix<{ user: env.RestUserResolver }>,
        @Query() query: env.QuerySessionColumnMessager
    ) {
        return await this.messagerService.httpSessionColumnMessager(headers, request.user.uid, query)
    }

    @Get('/session/resolver')
    @ApiDecorator({
        operation: { summary: '获取消息详情' },
        authorize: { check: true, next: false },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpSessionOneMessager(
        @Headers() headers: env.Headers,
        @Request() request: env.Omix<{ user: env.RestUserResolver }>,
        @Query() query: env.QuerySessionOneMessager
    ) {
        return await this.messagerService.httpSessionOneMessager(headers, query)
    }
}
