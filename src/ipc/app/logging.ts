import { ipcMain } from 'electron'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import normalize from 'normalize-path'
import { Window as NodeWindow } from 'node-screenshots'
import { handle as getMabinogiProcess } from '../../ipc/hardware/mabinogi.js'
import { getConfig } from '../../db/config.js'
import { createThrottling } from '../../utils/timer.js'
import { getLoggingDistDirectory } from '../../helpers/logger.js'

let cancelCapture: ReturnType<ReturnType<typeof createThrottling>> = null
let running = false

const CAPTURE_MIN_WIDTH = 1024
const CAPTURE_MAX_WIDTH = 1280
const CAPTURE_QUALITY = 20

function getScreenshotWidth(width: number, minWidth: number, maxWidth: number): number {
  return Math.min(
    Math.max(minWidth, width),
    maxWidth
  )
}

function getScreenshotName(date: Date): string {
  const timestamp = date.getTime()
  const name = date.toTimeString().split(' ')[0].replace(/\:/g, '').split('.')[0]
  return `${timestamp}_${name}`
}

function getMabinogiWindow(win: NodeWindow) {
  return win.appName === 'Mabinogi'
}

async function capture({
  win,
  directory,
  minWidth = 1024,
  maxWidth = 1280,
  quality = 20,
}: {
  win: NodeWindow,
  directory: string
  minWidth?: number
  maxWidth?: number
  quality?: number
}) {
  const now       = new Date()
  const image     = win.captureImageSync()
  const imageData = image.toRawSync(false)
  const name      = getScreenshotName(now)
  const width     = getScreenshotWidth(1280, minWidth, maxWidth)
  
  directory = normalize(join(
    directory,
    (now.getFullYear()).toString().padStart(4, '0'),
    (now.getMonth()+1).toString().padStart(2, '0'),
    (now.getDate()).toString().padStart(2, '0'),
  ))

  await mkdir(directory, { recursive: true })
  await sharp(imageData, {
    raw: {
      width: image.width,
      height: image.height,
      channels: 4
    }
  })
    .resize({ width, fit: 'inside', kernel: sharp.kernel.lanczos3 })
    .toColorspace('b-w')
    .webp({ quality, effort: 0 })
    .toFile(`${join(directory, name)}.webp`)
}

async function loop() {
  if (cancelCapture) {
    return
  }
  const { loggingInterval } = getConfig()
  const throttling = createThrottling()
  cancelCapture = throttling(async () => {
    cancelCapture = null
    loop()
    const { logging, loggingDirectory } = getConfig()
    if (logging) {
      const win = NodeWindow.all().find(getMabinogiWindow)
      if (!win) return
      if (!running) return
      await capture({
        win,
        directory: getLoggingDistDirectory(loggingDirectory),
        minWidth: CAPTURE_MIN_WIDTH,
        maxWidth: CAPTURE_MAX_WIDTH,
        quality: CAPTURE_QUALITY,
      })
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
