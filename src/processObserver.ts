import { ActiveWindow, WindowInfo } from '@paymoapp/active-window'
import { useHookallSync } from 'hookall'

type SubScribeFn = typeof ActiveWindow.subscribe
type SubscribeCallback = () => void
type SubscribeHook = {
  'activate': SubscribeCallback
  'deactivate': SubscribeCallback
}

const watchIds: number[] = []
let ready = false

export function checkInit() {
  if (!ready) {
    throw new Error('You must init first.')
  }
}

export function init() {
  if (ready) {
    throw new Error('Already init.')
  }
  ready = true
  ActiveWindow.initialize()
}

function subscribe(
  ...callback: Parameters<SubScribeFn>
): ReturnType<SubScribeFn> {
  checkInit()
  const watchId = ActiveWindow.subscribe(...callback)
  watchIds.push(watchId)
  return watchId
}

function unsubscribe(id: number) {
  checkInit()
  ActiveWindow.unsubscribe(id)
}

export function unsubscribeAll() {
  checkInit()
  watchIds.forEach((id) => ActiveWindow.unsubscribe(id))
}

export function getActivateWindow() {
  return ActiveWindow.getActiveWindow()
}

function createHook(pid: number) {
  const hooker = useHookallSync<SubscribeHook>({})
  let activated = ActiveWindow.getActiveWindow().pid === pid

  const onActivate = (callback: SubscribeCallback) => {
    hooker.onBefore('activate', callback)
  }
  const onDeactivate = (callback: SubscribeCallback) => {
    hooker.onBefore('deactivate', callback)
  }
  const emitActivate = () => {
    hooker.trigger('activate', undefined, () => {})
  }
  const emitDeactivate = () => {
    hooker.trigger('deactivate', undefined, () => {})
  }
  const getActivate = () => activated

  const hook = (win: WindowInfo) => {
    if (win.pid === pid) {
      activated = true
      hooker.trigger('activate', undefined, () => {})
    }
    else {
      activated = false
      hooker.trigger('deactivate', undefined, () => {})
    }
  }

  return {
    hook,
    hooker,
    onActivate,
    onDeactivate,
    emitActivate,
    emitDeactivate,
    getActivate,
  }
}

class Subscriber {
  readonly pid: number
  protected readonly hook: ReturnType<typeof createHook>
  protected readonly subscribeId: number

  constructor(pid: number) {
    const hook = createHook(pid)
    this.pid = pid
    this.hook = hook
    this.subscribeId = subscribe(hook.hook)
  }

  get windowActivated(): boolean {
    return this.hook.getActivate()
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
  }
}

export function createSubscriber(pid: number) {
  return new Subscriber(pid)
}
