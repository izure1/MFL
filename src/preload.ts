// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'
import { IpcRendererEvent } from 'electron/renderer'
import { ConfigScheme, IProcess, MacroScheme, MacroSchemeMap, IOEvent } from './types'

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
    directoryOpen: (): Promise<void> => ipcRenderer.invoke('app-directory-open'),
  },
  config: {
    get: (): Promise<ConfigScheme> => ipcRenderer.invoke('config-get'),
    set: (config: Partial<ConfigScheme>): Promise<void> => ipcRenderer.invoke('config-set', config),
  },
  macro: {
    getMap: (): Promise<MacroSchemeMap> => ipcRenderer.invoke('macro-get-map'),
    get: (name: string): Promise<MacroScheme> => ipcRenderer.invoke('macro-get', name),
    set: (name: string, scheme: MacroScheme): Promise<MacroScheme> => ipcRenderer.invoke('macro-set', name, scheme),
    remove: (name: string): Promise<boolean> => ipcRenderer.invoke('macro-remove', name),
    onUpdate: (callback: (schemeMap: MacroSchemeMap) => void) => ipcRenderer.on('macro-on-update', (
      _e,
      schemeMap: MacroSchemeMap
    ) => callback(schemeMap)),
  },
  io: {
    on: (callback: (e: IOEvent) => void) => {
      const wrapper = (_e: IpcRendererEvent, ioEvent: IOEvent) => callback(ioEvent)
      ipcRenderer.on('io-on', wrapper)
      return wrapper
    },
    off: (
      wrapper: (_e: IpcRendererEvent, ioEvent: IOEvent) => void
    ) => ipcRenderer.off('io-on', wrapper),
  },
  external: {
    open: (url: string): Promise<void> => ipcRenderer.invoke('external-open', url),
    showItem: (fullPath: string): Promise<void> => ipcRenderer.invoke('external-show-item', fullPath),
  }
}

contextBridge.exposeInMainWorld('ipc', context)

ipcRenderer.on('log', (_e, ...message: any) => {
  console.log(...message)
})
