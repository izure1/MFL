import { ipcMain } from 'electron'
import { fetchInspectTarget } from '../../db/auctionSubscribe.js'

export async function handle() {
  fetchInspectTarget()
}

export function ipc() {
  ipcMain.handle('auction-request-fetch-wanted', async () => {
    return await handle()
  })
}
