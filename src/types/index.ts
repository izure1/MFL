export interface IProcess {
  pid: number
  cmd: string
  name: string
}

export interface ConfigScheme {
  limit: number
  running: boolean
}
