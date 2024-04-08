import { Injectable, Inject } from '@nestjs/common'
import { OSS_CLIENT, OSS_STS_CLIENT, Client, ClientAuthorize } from '@/services/aliyun/aliyun.provider'

@Injectable()
export class AliyunService {
    constructor(
        @Inject(OSS_CLIENT) public readonly client: Client,
        @Inject(OSS_STS_CLIENT) public readonly clientAuthorize: ClientAuthorize
    ) {}
}
