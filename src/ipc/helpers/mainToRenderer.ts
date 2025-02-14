import { BrowserWindow } from 'electron'

export function handle(channel: string, ...args: any) {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send(channel, ...args)
  })
}
