import { dialog } from 'electron'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { getFilePathFromHomeDir } from './homedir.js'

export class CrashReport {
  protected path: string
  protected running: boolean

  private static _Instance: CrashReport|null = null

  static GetInstance(): CrashReport {
    if (!CrashReport._Instance) {
      CrashReport._Instance = new CrashReport()
    }
    return CrashReport._Instance
  }

  private constructor(path: string = './Logs/Crashes') {
    this.running = false
    this.path = ''
    this.setPath(getFilePathFromHomeDir(path))
  }

  setPath(path: string): void {
    this.path = path
    mkdirSync(path, { recursive: true })
  }

  private async _logFile(err: Error): Promise<string> {
    const text = JSON.stringify({
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause,
    }, null, 2)
    const file = join(this.path, Date.now().toString() + '.log')
    await writeFile(file, text)
    return text
  }

  start(): void {
    if (this.running) {
      return
    }
    this.running = true
    process.on('uncaughtException', async (err) => {
      dialog.showErrorBox(err.name, await this._logFile(err))
      process.exit(err.message)
    })
  }
}

export const crashReport = CrashReport.GetInstance()
