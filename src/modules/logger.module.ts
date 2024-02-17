import { Module, Global, DynamicModule } from '@nestjs/common'
import { WinstonModule } from 'nest-winston'
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
                                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                                winston.format.json(),
                                //prettier-ignore
                                winston.format.printf(data => {
									const name = chalk.hex('#ff5c93')(`[${option.name}]`)
									const pid = chalk.green(process.pid)
									const timestamp = chalk.hex('#fb9300')(`--- ${data.timestamp} ---`)
									const message = chalk.yellow(`[${data.message}]`)
									const level = data.level === 'error' ?  chalk.red('ERROR') : chalk.green(data.level.toUpperCase())
									const module = `${name} ${pid} ${timestamp}  ${level}  ${message}`
									if (typeof data.log === 'string') {
										console[data.level](module, { log: data.log })
										return `[${option.name}] ${process.pid} --- ${data.timestamp} --- ${data.level.toUpperCase()}  [${data.message}] {\n"log": ${data.log}}`
									} else {
										const text = Object.keys(data.log ?? {}).reduce((current, key) => {
											return (current += `	"${key.toString()}": ${JSON.stringify(data.log[key.toString()])}, \n`)
										}, '')
										if (data.log.url) {
											const url = chalk.hex('#fc5404')(`${data.log.url ?? ''}`)
											const d = chalk.yellow(': ')
											console[data.level](module + d + url, { ...data.log })
											return `[${option.name}] ${process.pid} --- ${data.timestamp} --- ${data.level.toUpperCase()}  [${data.message}]: ${data.log.url} {\n${text}}`
										} else {
											console[data.level](module, { ...data.log })
											return `[${option.name}] ${process.pid} --- ${data.timestamp} --- ${data.level.toUpperCase()}  [${data.message}] {\n${text}}`
										}
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
