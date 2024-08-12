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

export function subscribe(
  ...callback: Parameters<SubScribeFn>
): ReturnType<SubScribeFn> {
  checkInit()
  const watchId = ActiveWindow.subscribe(...callback)
  watchIds.push(watchId)
  return watchId
}

export function unsubscribe(id: number) {
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

export function createHook(pid: number) {
  const hooker = useHookallSync<SubscribeHook>({})

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

  const hook = (win: WindowInfo) => {
    if (win.pid === pid) {
      hooker.trigger('activate', undefined, () => {})
    }
    else {
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
  }
}
