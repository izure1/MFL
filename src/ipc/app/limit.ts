import { ipcMain } from 'electron'
import { suspend, resume } from 'ntsuspend'

import { subscribe } from '../../processObserver'
import { handle as getMabinogiProcess } from '../hardware/mabinogi'
import { getConfig } from '../../config'
import { IProcess } from '../../types'

let loopId: NodeJS.Timeout
let process: IProcess
let sleeping = false
let step = 0
let activatedWinPID = NaN

const JOB_LOOP_INTERVAL = 100

// subscribe pid when window focus changed
subscribe((win) => {
  activatedWinPID = win.pid
})

function stopLoop() {
  if (!loopId) {
    return
  }
  clearInterval(loopId)
  loopId = null
  step = 0
}

function awake(pid: number) {
  if (!sleeping) {
    return
  }
  resume(pid)
  sleeping = false
}

function cleanUp(pid: number) {
  awake(pid)
  stopLoop()
}

function startLoop(pid: number) {
  stopLoop()
  loopId = setInterval(() => loop(pid), JOB_LOOP_INTERVAL)
}

function sleep(pid: number) {
  if (sleeping) {
    return
  }
  suspend(pid)
  sleeping = true
}

function loop(pid: number) {
  const { limit, running } = getConfig()
  if (!running) {
    return cleanUp(pid)
  }
  step++
  const isMabinogiActivated = activatedWinPID === pid
  if (isMabinogiActivated) {
    awake(pid)
    step = 0
    return
  }
  if (
    Math.floor(step * limit / 100) >
    Math.floor((step - 1) * limit / 100)
  ) {
    sleep(pid)
  }
  else {
    awake(pid)
  }
  if (step >= 100) {
    step = 0
  }
}

export async function handle(active: boolean) {
  if (process === undefined) {
    process = await getMabinogiProcess()
  }
  if (!process) {
    return false
  }
  const { pid } = process
  cleanUp(pid)
  if (active) {
    startLoop(pid)
  }
  return true
}

export function ipc() {
  ipcMain.handle('app-limit', async () => {
    return await handle(true)
  })
}
