export async function delay(t: number) {
  return new Promise((resolve) => setTimeout(resolve, t))
}

type TaskRunner = (handler: TimerHandler, interval: number) => NodeJS.Timeout|number|null
type TaskCleaner<T extends TaskRunner> = (id: ReturnType<T>) => void

function createTask(handler: TaskRunner, cleaner: TaskCleaner<typeof handler>) {
  let id: ReturnType<TaskRunner> = null

  function cancel() {
    if (id) {
      cleaner(id)
      id = null
    }
  }

  function wrapper(callback: Function, interval: number, immediate = false) {
    cancel()
    if (immediate) {
      callback()
    }
    id = handler(callback, interval)
    return cancel
  }

  return wrapper
}

export function createThrottling() {
  return createTask(setTimeout, clearTimeout)
}

export function createRepeat() {
  return createTask(setInterval, clearInterval)
}
