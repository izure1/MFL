import { context } from '../preload.js'

export const ipc = (window as any).ipc as typeof context
