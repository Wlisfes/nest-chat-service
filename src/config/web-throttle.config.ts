import { seconds } from '@nestjs/throttler'

/**速率控制配置**/
export const WEB_THROTTLE = {
    default: { limit: 100, ttl: seconds(10) }, //10秒100次=1s/10pc
    small: { name: 'small', limit: 25, ttl: seconds(5) }, //5秒25次=1s/5pc
    large: { name: 'large', limit: 1200, ttl: seconds(60) } //60秒1200次=2/20pc
}
