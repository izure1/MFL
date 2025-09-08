import { Worker } from 'node:worker_threads'

export function spawnWorker<T, R>(worker: Worker, data: T): Promise<R> {
  return new Promise((resolve, reject) => {
    worker.once('message', resolve)
    worker.once('message', () => worker.terminate())
    worker.once('error', reject)
    worker.once('error', () => worker.terminate())
    worker.once('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
      worker.terminate()
    })
    worker.postMessage(data)
  })
}

class PreserveWorker<T, R> {
  private _worker: Worker
  private _requesting: boolean
  readonly name: string

  get worker() {
    return this._worker
  }

  get isBusy() {
    return this._requesting
  }

  constructor(worker: Worker, name = '') {
    this.name = name
    this._worker = worker
    this._requesting = false
    worker.setMaxListeners(0)
  }

  request(data: T): Promise<R> {
    this._requesting = true
    return new Promise((resolve, reject) => {
      const clear = () => {
        if (!this._requesting) return
        this._worker.off('message', onMessage)
        this._worker.off('error', onError)
        this._worker.off('exit', onExit)
        this._requesting = false
      }
      const onError = (err?: any) => {
        reject(err)
        clear()
      }
      const onMessage = (result: R) => {
        resolve(result)
        clear()
      }
      const onExit = (code: number) => {
        this._worker.terminate()
        clear()
        if (code !== 0) throw new Error(`Worker stopped with exit code ${code}`)
      }
      this._worker.on('message', onMessage)
      this._worker.on('error', onError)
      this._worker.on('exit', onExit)
      this._worker.postMessage(data)
    })
  }

  terminate() {
    this._worker.terminate()
  }
}

export function spawnPreserveWorker<T, R>(worker: Worker, name = ''): PreserveWorker<T, R> {
  return new PreserveWorker<T, R>(worker, name)
}
