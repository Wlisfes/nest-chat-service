import { Controller, Get, Post, Body, Headers, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { MessagerService } from '@/services/messager.service'
import { ApiDecorator } from '@/decorator/compute.decorator'
import * as env from '@/interface/instance.resolver'

@ApiTags('聊天模块')
@Controller('messager')
export class MessagerController {
    constructor(private readonly messagerService: MessagerService) {}

    @Post('/customize/transmitter')
    @ApiDecorator({
        operation: { summary: '发送自定义消息' },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpCustomizeMessager(@Headers() headers: env.Headers) {
        return await this.messagerService.httpCustomizeMessager(headers)
    }
}
