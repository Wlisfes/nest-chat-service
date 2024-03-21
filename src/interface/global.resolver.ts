export type Omix<T = Record<any, any>> = Record<any, any> & {
    [P in keyof T]: T[P]
}
