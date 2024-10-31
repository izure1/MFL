import { Worker } from 'node:worker_threads'

export function spawnWorker<T, R>(worker: Worker, data: T): Promise<R> {
  return new Promise((resolve, reject) => {
    worker.postMessage(data)
    worker.once('message', resolve)
    worker.once('message', () => worker.terminate())
    worker.once('error', reject)
    worker.once('error', () => worker.terminate())
    worker.once('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
      worker.terminate()
    })
  })
}
