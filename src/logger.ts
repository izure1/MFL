import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import normalize from 'normalize-path'
import { Window as NodeWindow } from 'node-screenshots'
import { handle as getMabinogiProcess } from './ipc/hardware/mabinogi.js'
import { createSubscriber as createProcessSubscriber, getActivateWindow } from './processObserver.js'
import { getConfig } from './db/config.js'
import { createThrottling } from './utils/timer.js'
import { getLoggingDistDirectory } from './helpers/logger.js'

let cancelCapture: ReturnType<ReturnType<typeof createThrottling>> = null
let processSubscriber: ReturnType<typeof createProcessSubscriber> = null
let eventAttached = false
let running = false

const CAPTURE_MIN_WIDTH = 1024
const CAPTURE_MAX_WIDTH = 1280
const CAPTURE_QUALITY = 20

async function checkMabinogiTerminated() {
  const process = await getMabinogiProcess()
  return !process
}

function getScreenshotWidth(width: number, minWidth: number, maxWidth: number): number {
  return Math.min(
    Math.max(minWidth, width),
    maxWidth
  )
}

function getScreenshotName(date: Date): string {
  const timestamp = date.getTime()
  const name = date.toISOString().split('T')[1].replace(/\:/g, '').split('.')[0]
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
    cancelCapture()
    cancelCapture = null
  }
  const { loggingInterval } = getConfig()
  const throttling = createThrottling()
  cancelCapture = throttling(async () => {
    loop()
    const { logging, loggingDirectory } = getConfig()
    if (logging) {
      const win = NodeWindow.all().find(getMabinogiWindow)
      if (!win) return
      if (!running) return
      if (!processSubscriber) return
      if (!processSubscriber.windowActivated) return
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
  const { pid } = mabinogiProcess
  processSubscriber = createProcessSubscriber(pid)
  running = true

  loop()

  if (!eventAttached) {
    const throttling = createThrottling()
    eventAttached = true
    processSubscriber.onDeactivate(() => {
      throttling(() => {
        if (processSubscriber.windowActivated || !eventAttached) {
          return
        }
        checkMabinogiTerminated().then((terminated: boolean) => {
          if (terminated) {
            stop()
          }
        })
      }, 10000)
    })
  }

  const activeWindow = getActivateWindow()
  if (activeWindow.pid === pid) {
    processSubscriber.emitActivate()
  }
  else {
    processSubscriber.emitDeactivate()
  }
}

export async function stop() {
  running = false
  if (cancelCapture) {
    cancelCapture()
    cancelCapture = null
  }
  if (processSubscriber) {
    processSubscriber.destroy()
    processSubscriber = null
  }
  eventAttached = false
}
