export async function delay(t: number) {
  return new Promise((resolve) => setTimeout(resolve, t))
}

export function createThrottling() {
  let job: NodeJS.Timeout|number|null = null

  function cancel() {
    if (job) {
      clearTimeout(job)
      job = null
    }
  }

  function throttling(callback: Function, interval: number) {
    cancel()
    job = setTimeout(callback, interval)
    return cancel
  }

  return throttling
}
