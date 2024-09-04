import type { IOKeyboardEvent, IOMouseEvent, IOWheelEvent } from './types'
import { uIOhook } from 'uiohook-napi'
import { useHookallSync } from 'hookall'
import { fromLinuxKeycode } from './utils/keycode'
export { UiohookKey } from 'uiohook-napi'

type IOHook = {
  'keydown': (e: IOKeyboardEvent) => IOKeyboardEvent
  'keyup': (e: IOKeyboardEvent) => IOKeyboardEvent
  'click': (e: IOMouseEvent) => IOMouseEvent
  'mousedown': (e: IOMouseEvent) => IOMouseEvent
  'mouseup': (e: IOMouseEvent) => IOMouseEvent
  'wheel': (e: IOWheelEvent) => IOWheelEvent
}

const hookers: Set<ReturnType<typeof useHookallSync<IOHook>>> = new Set()

uIOhook
  .on('keydown', (e) => {
    const event: IOKeyboardEvent = {
      type: 'keyboard',
      original: e
    }
    const key = fromLinuxKeycode(e.keycode)
    if (!key) {
      return
    }
    hookers.forEach((hooker) => hooker.trigger('keydown', event, (e) => e))
  })
  .on('keyup', (e) => {
    const event: IOKeyboardEvent = {
      type: 'keyboard',
      original: e
    }
    const key = fromLinuxKeycode(e.keycode)
    if (!key) {
      return
    }
    hookers.forEach((hooker) => hooker.trigger('keyup', event, (e) => e))
  })
  .on('click', (e) => {
    const event: IOMouseEvent = {
      type: 'mouse',
      original: e
    }
    hookers.forEach((hooker) => hooker.trigger('click', event, (e) => e))
  })
  .on('mousedown', (e) => {
    const event: IOMouseEvent = {
      type: 'mouse',
      original: e
    }
    hookers.forEach((hooker) => hooker.trigger('mousedown', event, (e) => e))
  })
  .on('mouseup', (e) => {
    const event: IOMouseEvent = {
      type: 'mouse',
      original: e
    }
    hookers.forEach((hooker) => hooker.trigger('mouseup', event, (e) => e))
  })
  .on('wheel', (e) => {
    const event: IOWheelEvent = {
      type: 'wheel',
      original: e
    }
    hookers.forEach((hooker) => hooker.trigger('wheel', event, (e) => e))
  })

export function createSubscriber() {
  const hook = useHookallSync<IOHook>({})

  hookers.add(hook)

  const unsubscribe = () => {
    hook.offAfter('keydown')
    hook.offAfter('keyup')
    hook.offAfter('click')
    hook.offAfter('mousedown')
    hook.offAfter('mouseup')
    hook.offAfter('wheel')
    hookers.delete(hook)
  }

  const onKeydown = (callback: (e: IOKeyboardEvent) => IOKeyboardEvent) => {
    hook.onAfter('keydown', callback)
  }

  const onKeyup = (callback: (e: IOKeyboardEvent) => IOKeyboardEvent) => {
    hook.onAfter('keyup', callback)
  }

  const onClick = (callback: (e: IOMouseEvent) => IOMouseEvent) => {
    hook.onAfter('click', callback)
  }

  const onMousedown = (callback: (e: IOMouseEvent) => IOMouseEvent) => {
    hook.onAfter('mousedown', callback)
  }

  const onMouseup = (callback: (e: IOMouseEvent) => IOMouseEvent) => {
    hook.onAfter('mouseup', callback)
  }

  const onWheel = (callback: (e: IOWheelEvent) => IOWheelEvent) => {
    hook.onAfter('wheel', callback)
  }

  return {
    onKeydown,
    onKeyup,
    onClick,
    onMousedown,
    onMouseup,
    onWheel,
    unsubscribe,
  }
}

uIOhook.start()
