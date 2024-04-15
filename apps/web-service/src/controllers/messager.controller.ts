import { Controller, Get, Post, Body, Headers, Request } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { MessagerService } from '@/services/messager.service'
import { ApiDecorator } from '@/decorator/compute.decorator'
import * as env from '@/interface/instance.resolver'

@ApiTags('聊天模块')
@Controller('messager')
export class MessagerController {
    constructor(private readonly messagerService: MessagerService) {}
}
