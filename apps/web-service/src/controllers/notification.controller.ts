import { Controller, Get, Post, Body, Headers, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { NotificationService } from '@/services/notification.service'
import { ApiDecorator } from '@/decorator/compute.decorator'
import * as env from '@/interface/instance.resolver'

@ApiTags('通知模块')
@Controller('notification')
export class NotificationController {
    constructor(private readonly notification: NotificationService) {}

    @Post('/update')
    @ApiDecorator({
        operation: { summary: '更新通知状态' },
        authorize: { check: true, next: false },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpNotificationUpdate(
        @Headers() headers: env.Headers,
        @Request() request: env.Omix<{ user: env.RestUserResolver }>,
        @Body() body: env.BodyNotificationUpdate
    ) {
        return await this.notification.httpNotificationUpdate(headers, request.user.uid, body)
    }

    @Get('/column')
    @ApiDecorator({
        operation: { summary: '通知列表' },
        authorize: { check: true, next: false },
        response: { status: 200, description: 'OK', type: env.NoticeResolver }
    })
    public async httpNotificationColumn(@Headers() headers: env.Headers, @Request() request: env.Omix<{ user: env.RestUserResolver }>) {
        return await this.notification.httpNotificationColumn(headers, request.user.uid)
    }
}
