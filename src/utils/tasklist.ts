import process from 'node:process'
import { promisify } from 'node:util'
import { join } from 'node:path'
import childProcess from 'node:child_process'
import isDev from 'electron-is-dev'


const TEN_MEGABYTES = 1000 * 1000 * 10
const execFile = promisify(childProcess.execFile)

export async function getTasklist() {
  let binary
  switch (process.arch) {
    case 'x64':
      binary = 'fastlist-0.3.0-x64.exe'
      break
    case 'ia32':
      binary = 'fastlist-0.3.0-x86.exe'
      break
    default:
      throw new Error(`Unsupported architecture: ${process.arch}`)
  }

  let binaryDirname
  if (isDev) {
    binaryDirname = join(process.cwd(), 'resources')
  }
  else {
    binaryDirname = process.resourcesPath
  }
  const binaryPath = join(binaryDirname, 'bin', binary)
  const { stdout } = await execFile(binaryPath, {
    maxBuffer: TEN_MEGABYTES,
    windowsHide: true,
  })

  return stdout
    .trim()
    .split('\r\n')
    .map(line => line.split('\t'))
    .map(([pid, ppid, name]) => ({
      pid: Number.parseInt(pid, 10),
      ppid: Number.parseInt(ppid, 10),
      name,
    }))
}
