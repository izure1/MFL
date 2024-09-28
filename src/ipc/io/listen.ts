import { ipcMain } from 'electron'
import { IOEvent } from '../../types/index.js'
import { createSubscriber } from '../../ioObserver.js'
import { sendIOSignal } from '../helpers/sendIOSignal.js'

let listening = false
let destroy: ReturnType<typeof createSubscriber>['unsubscribe']|null = null

export async function handle(start: boolean) {
  if (listening === start) {
    return
  }
  if (!listening) {
    listening = false
    if (destroy) {
      destroy()
      destroy = null
    }
    return
  }

  listening = true
  const {
    onClick,
    onKeydown,
    onKeyup,
    onMousedown,
    onMouseup,
    onWheel,
    unsubscribe
  } = createSubscriber()

  destroy = unsubscribe

  const wrapper = <T extends IOEvent>(e: T) => {
    sendIOSignal(e)
    return e
  }

  onClick(wrapper)
  onKeydown(wrapper)
  onKeyup(wrapper)
  onMousedown(wrapper)
  onMouseup(wrapper)
}

export function ipc() {
  ipcMain.handle('io-listen', async (_e, listen: boolean) => {
    return await handle(listen)
  })
}
