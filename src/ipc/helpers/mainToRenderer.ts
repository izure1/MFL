import { BrowserWindow } from 'electron'

export function handle(channel: string, ...args: any) {
  BrowserWindow.getAllWindows().at(0).webContents.send(channel, ...args)
}
