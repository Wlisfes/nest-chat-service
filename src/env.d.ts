type Refer<K = string, T = any> = Record<K, T>
type Omix<T = Refer> = T & Refer
