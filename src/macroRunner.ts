import type { MacroDelayUnit, MacroIOUnit, MacroScheme, MacroUnit } from './types'
import { Hardware } from 'keysender'
import {
  createHook as createProcessHook,
  subscribe as processSubscribe,
  unsubscribe as processUnsubscribe
} from './processObserver'
import {
  createSubscriber as createIOSubscriber
} from './ioObserver'
import { getMacroMap } from './db/macro'
import { getConfig } from './db/config'
import { handle as findMabinogi } from './ipc/hardware/mabinogi'
import { fromLinuxKeycode } from './utils/keycode'
import { delay } from './utils/timer'

let mabinogiActivated = false
let mabinogiPID: number = null
let processHookerID: number = null
let processHooker: ReturnType<typeof createProcessHook> = null
let IOSubscriber: ReturnType<typeof createIOSubscriber> = null
let bindingLifeCycles: MacroLifecycle[] = []

let running = false
let sleepDuration = 10
let hardware = new Hardware()

class MacroLifecycle {
  readonly name: string
  readonly type: MacroScheme['type']
  readonly trigger: MacroIOUnit
  readonly units: MacroUnit[]
  private _destroyed: boolean
  private _keeping: boolean

  static readonly MouseButton = {
    '1': 'left',
    '2': 'right',
    '3': 'middle',
  } as const

  constructor(scheme: MacroScheme) {
    const { name, type, trigger, units } = scheme
    this.name = name
    this.type = type
    this.trigger = trigger
    this.units = units
    this._destroyed = false
  }

  private get _config() {
    return getConfig()
  }

  get keeping() {
    return this._keeping
  }

  set keeping(v: boolean) {
    this._keeping = v
  }

  private _getMouseButton(button: number): 'left'|'middle'|'right' {
    const key = button.toString() as keyof typeof MacroLifecycle.MouseButton
    const name =  MacroLifecycle.MouseButton[key]
    if (!name) {
      throw new Error(`Unknown Mouse button. Got a '${button}'.`)
    }
    return name
  }

  private async _runUnit(unit: MacroUnit): Promise<void> {
    switch (unit.hardware) {
      case 'delay':     return this._delay(unit)
      case 'keyboard':  return this._keyToggle(unit)
      case 'mouse':     return this._mouseToggle(unit)
    }
  }

  private async _delay(unit: MacroDelayUnit): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, unit.duration)
    })
  }

  private async _keyToggle(unit: MacroIOUnit): Promise<void> {
    const key = fromLinuxKeycode(unit.button)
    if (!key) {
      return
    }
    const isDown = unit.toggle === 'down'
    hardware.keyboard.toggleKey(key, isDown)
  }
  
  private async _mouseToggle(unit: MacroIOUnit): Promise<void> {
    const isDown = unit.toggle === 'down'
    hardware.mouse.toggle(this._getMouseButton(unit.button), isDown)
  }

  async run(): Promise<void> {
    running = true
    let escaped = false
    for (const unit of this.units) {
      if (this._destroyed) {
        escaped = true
        break
      }
      if (!this._config.running) {
        escaped = true
        break
      }
      if (!mabinogiActivated) {
        escaped = true
        break
      }
      await this._runUnit(unit)
      await delay(sleepDuration)
    }
    running = false
    if (escaped) {
      this.keeping = false
    }
    if (this.keeping) {
      this.run()
    }
  }

  destroy(): void {
    this._destroyed = true
  }
}

function createLifeCycle(scheme: MacroScheme) {
  return new MacroLifecycle(scheme)
}

function getLifecycleKeeping(lifecycle: MacroLifecycle, toggle: 'down'|'up'): boolean {
  switch (lifecycle.type) {
    case 'once':    return false
    case 'while':   return toggle === 'down'
    case 'repeat':  return !(toggle === 'down' || lifecycle.keeping)
  }
}

function bindKeyboard(lifecycle: MacroLifecycle) {
  IOSubscriber.onKeydown((e) => {
    if (!mabinogiActivated) {
      return e
    }
    if (running) {
      return e
    }
    if (e.original.keycode !== lifecycle.trigger.button) {
      return e
    }
    lifecycle.keeping = getLifecycleKeeping(lifecycle, 'down')
    lifecycle.run()
    return e
  })
  IOSubscriber.onKeyup((e) => {
    if (!mabinogiActivated) {
      return e
    }
    if (e.original.keycode !== lifecycle.trigger.button) {
      return e
    }
    lifecycle.keeping = getLifecycleKeeping(lifecycle, 'up')
    return e
  })
}

function bindMouse(lifecycle: MacroLifecycle) {
  IOSubscriber.onMousedown((e) => {
    if (!mabinogiActivated) {
      return e
    }
    if (running) {
      return e
    }
    if (e.original.button !== lifecycle.trigger.button) {
      return e
    }
    lifecycle.keeping = getLifecycleKeeping(lifecycle, 'down')
    lifecycle.run()
    return e
  })
  IOSubscriber.onMouseup((e) => {
    if (!mabinogiActivated) {
      return e
    }
    if (e.original.button !== lifecycle.trigger.button) {
      return e
    }
    lifecycle.keeping = getLifecycleKeeping(lifecycle, 'up')
    return e
  })
}

function bindLifecycle(lifecycle: MacroLifecycle) {
  if (bindingLifeCycles.includes(lifecycle)) {
    return
  }
  bindingLifeCycles.push(lifecycle)
  switch (lifecycle.trigger.hardware) {
    case 'keyboard': return bindKeyboard(lifecycle)
    case 'mouse': return bindMouse(lifecycle)
  }
}

function unbindLifeCycles() {
  for (const lifecycle of bindingLifeCycles) {
    lifecycle.destroy()
  }
  bindingLifeCycles.length = 0
}

export async function start() {
  await stop()
  const { pid } = await findMabinogi()
  mabinogiPID = pid
  processHooker = createProcessHook(mabinogiPID)
  processHookerID = processSubscribe(processHooker.hook)
  IOSubscriber = createIOSubscriber()

  processHooker.onActivate(() => {
    mabinogiActivated = true
  })
  processHooker.onDeactivate(() => {
    mabinogiActivated = false
  })
  const macroSchemeMap = getMacroMap()
  for (const key in macroSchemeMap) {
    const scheme = macroSchemeMap[key]
    if (!scheme.trigger) {
      continue
    }
    const lifecycle = createLifeCycle(scheme)
    bindLifecycle(lifecycle)
  }
}

export async function stop() {
  if (processHooker) {
    processUnsubscribe(processHookerID)
    processHooker = null
    processHookerID = null
    mabinogiPID = null
    mabinogiActivated = false
  }
  if (!IOSubscriber) {
    return
  }
  unbindLifeCycles()
  IOSubscriber.unsubscribe()
  IOSubscriber = null
}