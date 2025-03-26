import { powerMonitor } from 'electron'

export type IdleFunction = (deltaTime: number) => void

export interface IdleWatch {
  duration: number
  sleep: boolean
  lastAwake: number
  once: boolean
  onSleep: IdleFunction
  onAwake: IdleFunction
}

class IdleWatcher {
  protected readonly watchInterval: number
  private readonly _idles: Map<string, IdleWatch>
  private _start: boolean
  private _timer: NodeJS.Timeout|null
  private _idle: number

  constructor(watchInterval: number) {
    this._idles = new Map()
    this.watchInterval = watchInterval
    this._start = false
    this._timer = null
    this._idle = 0
  }

  get started(): boolean {
    return this._start
  }

  start(): void {
    this._start = true
    this._idle = 0
    this._timer = setInterval(() => {
      const now = Date.now()
      const idleTime = powerMonitor.getSystemIdleTime() * 1000
      this.awakes(now, idleTime)
      this.idles(now, idleTime)
      this._idle = idleTime
    }, this.watchInterval)
  }

  destroy(): void {
    this._idles.clear()
    clearTimeout(this._timer)
  }

  protected awakes(now: number, idleTime: number): void {
    if (this._idle <= idleTime) {
      return
    }
    for (const [id, idle] of this._idles) {
      this.awake(id, idle, now)
    }
  }

  protected awake(id: string, idle: IdleWatch, now: number): void {
    if (!idle.sleep) {
      return
    }
    idle.onAwake(now - idle.lastAwake)
    idle.sleep = false
    idle.lastAwake = now
    if (idle.once) {
      this._idles.delete(id)
    }
  }

  protected idles(now: number, idleTime: number): void {
    for (const [id, idle] of this._idles) {
      this.idle(idle, now, idleTime)
    }
  }

  protected idle(idle: IdleWatch, now: number, idleTime: number): void {
    const deltaTime = now - idle.lastAwake
    if (idle.sleep || idleTime < idle.duration) {
      return
    }
    idle.lastAwake = now
    idle.sleep = true
    idle.onSleep(deltaTime)
  }

  onIdle(duration: number, onSleep: IdleFunction, onAwake: IdleFunction): string {
    const id = crypto.randomUUID()
    this._idles.set(id, {
      once: false,
      sleep: false,
      lastAwake: Date.now(),
      duration,
      onSleep,
      onAwake,
    })
    return id
  }

  onceIdle(duration: number, onSleep: IdleFunction, onAwake: IdleFunction): string {
    const id = crypto.randomUUID()
    this._idles.set(id, {
      once: true,
      sleep: false,
      lastAwake: Date.now(),
      duration,
      onSleep,
      onAwake,
    })
    return id
  }

  offIdle(id: string, awake: boolean = false): void {
    if (awake) {
      const idle = this._idles.get(id)
      if (!idle || !idle.sleep) {
        return
      }
      this.awake(id, idle, Date.now())
    }
    this._idles.delete(id)
  }
}

export const idleWatcher = new IdleWatcher(200)
