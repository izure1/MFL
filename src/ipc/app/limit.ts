import { setPriority, constants } from 'node:os'
import { ipcMain } from 'electron'
import { suspend, resume } from 'ntsuspend'

import { createHook, getActivateWindow, subscribe, unsubscribe } from '../../processObserver'
import { handle as getMabinogiProcess } from '../hardware/mabinogi'
import { handle as rendererLog } from '../app/log'
import { getConfig } from '../../config'
import { IProcess } from '../../types'

let loopId: NodeJS.Timeout
let process: IProcess
let sleeping = false
let step = 0
let mabinogiActivated = false
let subscriberAttached = false

const JOB_LOOP_INTERVAL = 100

class Subscriber {
  private static _Instance: Subscriber|null

  static GetInstance(pid: number) {
    if (!Subscriber._Instance) {
      Subscriber._Instance = new Subscriber(pid, createHook(pid))
    }
    if (Subscriber._Instance.pid !== pid) {
      throw new Error(`Not matched pid. It expect ${pid}, but existed instance has ${Subscriber._Instance.pid}.`)
    }
    return Subscriber._Instance
  }

  protected readonly pid: number
  protected readonly hook: ReturnType<typeof createHook>
  protected readonly subscribeId: number

  private constructor(pid: number, hook: ReturnType<typeof createHook>) {
    this.pid = pid
    this.hook = hook
    this.subscribeId = subscribe(hook.hook)
  }

  onActivate(...callback: Parameters<typeof this.hook.onActivate>) {
    return this.hook.onActivate(...callback)
  }

  onDeactivate(...callback: Parameters<typeof this.hook.onDeactivate>) {
    return this.hook.onDeactivate(...callback)
  }

  emitActivate() {
    return this.hook.emitActivate()
  }

  emitDeactivate() {
    return this.hook.emitDeactivate()
  }

  destroy() {
    this.hook.hooker.offBefore('activate')
    this.hook.hooker.offBefore('deactivate')
    unsubscribe(this.subscribeId)
    Subscriber._Instance = null
  }
}

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
  if (mabinogiActivated) {
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
  const subscriber = Subscriber.GetInstance(pid)

  if (!active) {
    mabinogiActivated = false
    subscriberAttached = false
    cleanUp(pid)
    subscriber.destroy()
    rendererLog('Mabinogi limit activation off.')
    return true
  }

  if (!subscriberAttached) {
    subscriberAttached = true
    subscriber.onActivate(() => {
      mabinogiActivated = true
      setPriority(pid, constants.priority.PRIORITY_HIGH)
      cleanUp(pid)
      rendererLog('Mabinogi activated.')
    })
    subscriber.onDeactivate(() => {
      mabinogiActivated = false
      setPriority(pid, constants.priority.PRIORITY_LOW)
      startLoop(pid)
      rendererLog('Mabinogi deactivated.')
    })
    subscriber.onDeactivate(() => {
      checkMabinogiTerminated().then((terminated: boolean) => {
        if (terminated) {
          mabinogiActivated = false
          subscriberAttached = false
          stopLoop()
          subscriber.destroy()
          rendererLog('Can\'t found Mabinogi process. Stop loop.')
        }
      })
    })
  }

  const activeWindow = getActivateWindow()
  if (activeWindow.pid === pid) {
    subscriber.emitActivate()
  }
  else {
    subscriber.emitDeactivate()
  }
  return true
}

export function ipc() {
  ipcMain.handle('app-limit', async () => {
    return await handle(true)
  })
}
