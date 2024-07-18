import { ActiveWindow } from '@paymoapp/active-window'

type SubScribeFn = typeof ActiveWindow.subscribe

const watchIds: number[] = []
let ready = false

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
  const watchId = ActiveWindow.subscribe(...callback)
  watchIds.push(watchId)
  return watchId
}

export function unsubscribeAll() {
  watchIds.forEach((id) => ActiveWindow.unsubscribe(id))
}
