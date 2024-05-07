import { Injectable } from '@nestjs/common'
import { CustomService } from '@/services/custom.service'
import { divineHandler } from '@/utils/utils-common'
import * as web from '@/config/web-instance'

@Injectable()
export class InitializeService {
    constructor(private readonly customService: CustomService) {}

    /**模块初始化**/
    async onModuleInit() {
        await this.fetchInitializeWallpaper()
    }

    /**背景颜色列表初始化**/
    private async fetchInitializeWallpaper() {
        const count = await this.customService.tableWallpaper.count()
        return await divineHandler(count === 0, {
            handler: async () => {
                const wallpaper = Object.keys(web.WEB_WALLPAPER).map(key => {
                    return Object.assign(web.WEB_WALLPAPER[key], { waid: key })
                })
                return await this.customService.divineBuilder(this.customService.tableWallpaper, async qb => {
                    qb.insert().values(wallpaper).execute()
                    return qb.getMany()
                })
            }
        })
    }
}
