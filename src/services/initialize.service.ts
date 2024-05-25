import { Injectable } from '@nestjs/common'
import { Cron, SchedulerRegistry } from '@nestjs/schedule'
import { CustomService } from '@/services/custom.service'
import { divineHandler } from '@/utils/utils-common'
import * as web from '@/config/web-instance'

@Injectable()
export class InitializeService {
    private failure: number = 0
    constructor(private readonly customService: CustomService, private readonly schedulerRegistry: SchedulerRegistry) {}

    /**模块初始化**/
    async onModuleInit() {
        await this.fetchInitializeWallpaper()
    }

    @Cron('*/45 * * * * *', { name: 'mysqlheartbeat' })
    private async fetchInitializeHeartbeat() {
        const job = this.schedulerRegistry.getCronJob('mysqlheartbeat')
        try {
            await this.customService.tableWallpaper.count()
        } catch (e) {
            return divineHandler(this.failure > 3, {
                failure: () => this.failure++,
                handler: () => job.stop()
            })
        }
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
