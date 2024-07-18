import { context } from '../preload'

export const ipc = (window as any).ipc as typeof context
