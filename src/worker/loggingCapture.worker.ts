import { parentPort } from 'node:worker_threads'
import { Window as NodeWindow } from 'node-screenshots'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import normalize from 'normalize-path'
import { catchError } from '../utils/error.js'

export interface WorkerParameter {
  appName: string
  directory: string
  minWidth?: number
  maxWidth?: number
  quality?: number
}

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

async function capture({
  appName,
  directory,
  minWidth = 1024,
  maxWidth = 1280,
  quality = 20,
}: {
  appName: string
  directory: string
  minWidth?: number
  maxWidth?: number
  quality?: number
}) {
  const win       = NodeWindow.all().find((win) => win.appName === appName)
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

parentPort.on('message', async (data: WorkerParameter) => {
  const [err, res] = await catchError(capture(data))
  if (err) {
    parentPort.postMessage(err)
    return
  }
  parentPort.postMessage(res)
})
