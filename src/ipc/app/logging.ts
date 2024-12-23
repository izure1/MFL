import type { WorkerParameter as CaptureWorkerParameter } from '../../worker/loggingCapture.worker.js'
import { join } from 'node:path'
import { Worker } from 'node:worker_threads'
import { ipcMain } from 'electron'
import { Window as NodeWindow } from 'node-screenshots'
import { handle as getMabinogiProcess } from '../../ipc/hardware/mabinogi.js'
import { getConfig } from '../../db/config.js'
import { createThrottling } from '../../utils/timer.js'
import { catchError } from '../../utils/error.js'
import { spawnWorker } from '../../utils/worker.js'
import { getLoggingDistDirectory } from '../../helpers/logger.js'

let cancelCapture: ReturnType<ReturnType<typeof createThrottling>> = null
let running = false

const CAPTURE_MIN_WIDTH = 1024
const CAPTURE_MAX_WIDTH = 1280
const CAPTURE_QUALITY = 20

function getMabinogiWindow(win: NodeWindow) {
  return win.appName === 'Mabinogi'
}

async function loop() {
  if (cancelCapture) {
    return
  }
  const { loggingInterval } = await getConfig()
  const throttling = createThrottling()
  cancelCapture = throttling(async () => {
    cancelCapture = null
    await loop()
    const { logging, loggingDirectory } = await getConfig()
    if (logging) {
      const win = NodeWindow.all().find(getMabinogiWindow)
      if (!win) return
      if (!running) return
      const workerPath = join(import.meta.dirname, './worker/loggingCapture.worker.js')
      const loggingTask = spawnWorker<CaptureWorkerParameter, Error|void>(
        new Worker(workerPath),
        {
          appName: 'Mabinogi',
          directory: getLoggingDistDirectory(loggingDirectory),
          minWidth: CAPTURE_MIN_WIDTH,
          maxWidth: CAPTURE_MAX_WIDTH,
          quality: CAPTURE_QUALITY,
        }
      )
      const [err] = await catchError(loggingTask)
      if (err) {
        throw err
      }
    }
  }, loggingInterval * 1000)
}

export async function start() {
  await stop()
  const mabinogiProcess = await getMabinogiProcess()
  if (!mabinogiProcess) {
    console.log('cannot found')
    return
  }
  running = true
  loop()
}

export async function stop() {
  running = false
  if (cancelCapture) {
    cancelCapture()
    cancelCapture = null
  }
}


export async function handle(active: boolean) {
  if (active) {
    await start()
  }
  else {
    await stop()
  }
}

export function ipc() {
  ipcMain.handle('app-logging', async () => {
    return await handle(true)
  })
}
