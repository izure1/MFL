import { basename, dirname, resolve } from 'node:path'
import { spawn } from 'node:child_process'


type StartupCallback = () => Promise<void>

function run(args: string[], done: StartupCallback): void {
  const updateExe = resolve(dirname(process.execPath), '..', 'Update.exe')
  spawn(updateExe, args, {
    detached: true
  }).on('close', done)
}

export function startup(callback: StartupCallback): boolean {
  if (process.platform === 'win32') {
    var cmd = process.argv[1]
    var target = basename(process.execPath)

    if (cmd === '--squirrel-install' || cmd === '--squirrel-updated') {
      run(['--createShortcut=' + target + ''], callback)
      return true
    }
    if (cmd === '--squirrel-uninstall') {
      run(['--removeShortcut=' + target + ''], callback)
      return true
    }
    if (cmd === '--squirrel-obsolete') {
      callback()
      return true
    }
  }
  return false
}
