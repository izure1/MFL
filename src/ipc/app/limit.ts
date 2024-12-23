import { ipcMain } from 'electron'
import { suspend, resume } from 'ntsuspend'

import { getActivateWindow, createSubscriber as createProcessSubscriber } from '../../processObserver.js'
import { start as startMacroRunner, stop as stopMacroRunner } from '../../macroRunner.js'
import { handle as getMabinogiProcess } from '../hardware/mabinogi.js'
import { handle as rendererLog } from '../app/log.js'
import { getConfig } from '../../db/config.js'
import { IProcess } from '../../types/index.js'
import { createThrottling } from '../../utils/timer.js'

let loopId: NodeJS.Timeout
let process: IProcess
let sleeping = false
let step = 0
let processSubscriber: ReturnType<typeof createProcessSubscriber> = null
let eventAttached = false

const JOB_LOOP_INTERVAL = 100

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

async function loop(pid: number) {
  const { limit, running } = await getConfig()
  if (!running) {
    return cleanUp(pid)
  }
  step++
  if (processSubscriber.windowActivated) {
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

async function checkMabinogiTerminated() {
  const process = await getMabinogiProcess()
  return !process
}

export async function handle(active: boolean) {
  if (process === undefined) {
    process = await getMabinogiProcess()
  }
  if (!process) {
    return false
  }
  const { pid } = process
  if (!processSubscriber) {
    processSubscriber = createProcessSubscriber(pid)
  }

  if (!active) {
    const terminated = await checkMabinogiTerminated()
    if (!terminated) {
      cleanUp(pid)
    }
    eventAttached = false
    processSubscriber.destroy()
    processSubscriber = null
    await stopMacroRunner()
    rendererLog('Mabinogi limit activation off.')
    return true
  }
  
  if (!eventAttached) {
    const throttling = createThrottling()
    eventAttached = true
    
    await startMacroRunner()

    processSubscriber.onActivate(() => {
      cleanUp(pid)
      rendererLog('Mabinogi activated.')
    })
    processSubscriber.onDeactivate(() => {
      startLoop(pid)
      rendererLog('Mabinogi deactivated.')
    })
    processSubscriber.onDeactivate(() => {
      throttling(() => {
        if (processSubscriber.windowActivated || !eventAttached) {
          return
        }
        checkMabinogiTerminated().then((terminated: boolean) => {
          if (terminated) {
            eventAttached = false
            stopLoop()
            processSubscriber.destroy()
            processSubscriber = null
            rendererLog('Can\'t found Mabinogi process. Stop loop.')
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

  return true
}

export function ipc() {
  ipcMain.handle('app-limit', async () => {
    return await handle(true)
  })
}
