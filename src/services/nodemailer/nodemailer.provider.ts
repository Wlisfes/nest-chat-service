import { createTransport } from 'nodemailer'
export const CLIENT_TRANSPORT = Symbol('CLIENT_TRANSPORT')
export type ClientTransport = ReturnType<typeof createTransport>

export interface NodemailerOption {
    host: string
    port: number
    secure: boolean
    user: string
    password: string
}

/**注册Nodemailer实例**/
export async function createNodemailer(option: NodemailerOption) {
    return createTransport({
        host: option.host,
        port: option.port,
        secure: option.secure ?? true,
        auth: {
            user: option.user,
            pass: option.password
        }
    })
}
