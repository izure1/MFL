// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'
import { ConfigScheme, IProcess } from './types'

export const context = {
  process: {
    suspend: (pid: number): Promise<boolean> => ipcRenderer.invoke('process-suspend', pid),
    resume: (pid: number): Promise<boolean> => ipcRenderer.invoke('process-resume', pid),
    mabinogi: (): Promise<IProcess|null> => ipcRenderer.invoke('process-mabinogi'),
    checkPermission: (): Promise<boolean> => ipcRenderer.invoke('process-check-permission')
  },
  app: {
    minimize: (): Promise<void> => ipcRenderer.invoke('app-minimize'),
    close: (): Promise<void> => ipcRenderer.invoke('app-close'),
    limit: (): Promise<boolean> => ipcRenderer.invoke('app-limit'),
    devtool: (): Promise<void> => ipcRenderer.invoke('app-devtool'),
  },
  config: {
    get: (): Promise<ConfigScheme> => ipcRenderer.invoke('config-get'),
    set: (config: Partial<ConfigScheme>): Promise<void> => ipcRenderer.invoke('config-set', config),
  },
  external: {
    open: (url: string): Promise<void> => ipcRenderer.invoke('external-open', url),
  }
}

contextBridge.exposeInMainWorld('ipc', context)

ipcRenderer.on('log', (_e, ...message: any) => {
  console.log(...message)
})
