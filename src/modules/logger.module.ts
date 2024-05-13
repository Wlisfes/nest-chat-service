import { Module, Global, DynamicModule } from '@nestjs/common'
import { WinstonModule } from 'nest-winston'
import { divineCaseWherer } from '@/utils/utils-common'
import * as web from '@/config/web-instance'
import * as winston from 'winston'
import * as chalk from 'chalk'
import 'winston-daily-rotate-file'

@Global()
@Module({})
export class LoggerModule {
    public static forRoot(option: { name: string }): DynamicModule {
        return {
            module: LoggerModule,
            imports: [
                WinstonModule.forRoot({
                    transports: [
                        new winston.transports.DailyRotateFile({
                            level: 'debug',
                            dirname: `logs/${option.name.toLowerCase()}`, // 日志保存的目录
                            filename: '%DATE%.log', // 日志名称，占位符 %DATE% 取值为 datePattern 值。
                            datePattern: 'YYYY-MM-DD', // 日志轮换的频率，此处表示每天。
                            zippedArchive: true, // 是否通过压缩的方式归档被轮换的日志文件。
                            maxSize: '20m', // 设置日志文件的最大大小，m 表示 mb 。
                            maxFiles: '30d', // 保留日志文件的最大天数，此处表示自动删除超过30天的日志文件。
                            format: winston.format.combine(
                                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
                                winston.format.json(),
                                //prettier-ignore
                                winston.format.printf(data => {
									const name = chalk.hex('#ff5c93')(`服务名称:[${option.name}]`)
									const pid = chalk.hex("#fc5404 ")(`服务进程:[${process.pid}]`)
									const timestamp = chalk.hex('#fb9300')(`${data.timestamp}`)
                                    const contextId = chalk.hex("#536dfe")(`上下文ID:[${data[web.WEB_COMMON_HEADER_CONTEXTID] ?? ''}]`)
									const message = chalk.hex("#ff3d68")(`执行方法:[${data.message}]`)
                                    const duration = divineCaseWherer(Boolean(data.duration), {
                                        value: chalk.hex("#ff3d68")(`耗时:${data.duration ?? '[]'}`),
                                        defaultValue: ''
                                    })
                                    const url = divineCaseWherer(Boolean(data.log?.url), {
                                        value: chalk.hex('#fc5404')(`接口地址:[${data.log?.url ?? ''}]`, ''),
                                        defaultValue: ""
                                    })
                                    const level = divineCaseWherer(data.level === 'error', {
                                        value: chalk.red('ERROR'),
                                        fallback: chalk.green(data.level.toUpperCase())
                                    })
									const module = `${name}  ${pid}  ${timestamp}  ${level}  ${contextId}  ${message}`
									if (typeof data.log === 'string') {
                                        if (data.duration) {
                                            console[data.level](`${module}  ${duration}  {\n    log: ${chalk.red(data.log)}\n}`)
                                            return `服务名称:[${option.name}] ${process.pid} ${data.timestamp} ${data.level.toUpperCase()}  上下文ID:[${data[web.WEB_COMMON_HEADER_CONTEXTID] ?? ''}]  执行方法:[${data.message}]  耗时:${data.duration}  {\n    "log": ${data.log}\n}`
                                        }
                                        console[data.level](`${module}   {\n    log: ${chalk.red(data.log)}\n}`)
                                        return `服务名称:[${option.name}] ${process.pid} ${data.timestamp} ${data.level.toUpperCase()}  上下文ID:[${data[web.WEB_COMMON_HEADER_CONTEXTID] ?? ''}]  执行方法:[${data.message}]  {\n    "log": ${data.log}\n}`
									} else {
                                        const text = Object.keys(data.log ?? {}).reduce((current, key) => {
                                            return (current += `	"${key.toString()}": ${JSON.stringify(data.log[key.toString()])}, \n`)
										}, '')
										if (data.log && data.log.url) {
											console[data.level](`${module}  ${url}  ${duration}`, { ...data.log })
											return `服务名称:[${option.name}]  服务进程:[${process.pid}]  ${data.timestamp}  ${data.level.toUpperCase()}  上下文ID:[${data[web.WEB_COMMON_HEADER_CONTEXTID] ?? ''}]  执行方法:[${data.message}]  接口地址:${data.log.url}  耗时:${data.duration}  {\n${text}}`
										} else if(data.duration) {
											console[data.level](`${module}  ${duration}`, { ...data.log })
											return `服务名称:[${option.name}]  服务进程:[${process.pid}]  ${data.timestamp}  ${data.level.toUpperCase()}  上下文ID:[${data[web.WEB_COMMON_HEADER_CONTEXTID] ?? ''}]  执行方法:[${data.message}]  耗时:${data.duration}  {\n${text}}`
										}
                                        console[data.level](module, { ...data.log })
										return `服务名称:[${option.name}]  服务进程:[${process.pid}]  ${data.timestamp}  ${data.level.toUpperCase()}  上下文ID:[${data[web.WEB_COMMON_HEADER_CONTEXTID] ?? ''}]  执行方法:[${data.message}]  {\n${text}}`
									}
								})
                            )
                        })
                    ]
                })
            ]
        }
    }
}
