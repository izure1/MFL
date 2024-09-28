declare module 'ntsuspend' {
  export function suspend(pid: number): boolean
  export function resume(pid: number): boolean
}
