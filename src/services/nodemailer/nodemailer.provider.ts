import { HttpException, HttpStatus } from '@nestjs/common'
import { createTransport } from 'nodemailer'
import { join } from 'path'
import { readFileSync } from 'fs'
import { compile } from 'handlebars'
import { Omix } from '@/interface/global.resolver'

export const CLIENT_TRANSPORT = Symbol('CLIENT_TRANSPORT')
export type ClientTransport = ReturnType<typeof createTransport>

export interface NodemailerOption {
    host: string
    port: number
    secure: boolean
    user: string
    password: string
}

export interface CustomizeOption {
    from: string
    to: string
    subject: string
    html: string
}

/**注册Nodemailer实例**/
export async function createNodemailer(option: NodemailerOption) {
    return createTransport({
        host: option.host,
        port: option.port,
        secure: option.secure ?? false,
        auth: {
            user: option.user,
            pass: option.password
        }
    })
}

/**读取模板**/
export function readNodemailer<T extends Omix>(source: string, option: Omix<T> = {} as Omix<T>) {
    try {
        const route = join(process.cwd(), `./src/services/nodemailer/templates/${source ?? 'authorize.html'}`)
        const content = readFileSync(route, 'utf8')
        return compile(content)(option)
    } catch (e) {
        throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
}

/**发送邮件**/
export function customNodemailer(transporter: ClientTransport, mailOption: CustomizeOption) {
    return new Promise((resolve, reject) => {
        return transporter.sendMail(mailOption, (error, info) => {
            if (error) {
                reject(error)
            } else {
                resolve(info)
            }
        })
    })
}
