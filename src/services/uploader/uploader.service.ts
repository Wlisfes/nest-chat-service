import { Injectable, Inject } from '@nestjs/common'
import { OSS_CLIENT, OSS_STS_CLIENT, Client, AuthClient } from '@/services/uploader/uploader.provider'

@Injectable()
export class UploaderService {
    constructor(@Inject(OSS_CLIENT) public readonly client: Client, @Inject(OSS_STS_CLIENT) public readonly sts: AuthClient) {}
}
