import { join } from 'path'
import { Notification } from 'electron'
import { EventEmitter } from 'node:events'
import { getFromCategory as getWatchesFromCategory } from './db/auctionWatch.js'
import { getItems } from './db/auctionCache.js'
import { addInspectQueue, changeItemInspectStage } from './db/auctionSubscribe.js'
import { handle as fetchAuctionItems } from './ipc/auction/fetch.js'
import { createRepeat, delay } from './utils/timer.js'
import { createXMLString } from './utils/xml.js'
import { getFilteredAuctionItems } from './helpers/auction.js'
import { handle as mainToRenderer } from './ipc/helpers/mainToRenderer.js'
import { AuctionWantedItemInspectStage, AuctionWantedItemTuple } from './types/index.js'

interface AuctionWatcherEvents {
  'notification-click': [AuctionWantedItemTuple[]]
}

export class AuctionWatcher extends EventEmitter<AuctionWatcherEvents> {
  static readonly FetchInterval = 1000 * 60 * 3 // 3minutes
  static readonly ParsingDelay = 50
  static readonly ParsingDelayPerEA = 1500

  private readonly _interval: number
  private readonly _parsingDelay: number
  private readonly _parsingDelayPerEA: number 
  private _running: boolean
  private _repeat: ReturnType<typeof createRepeat>
  private _cancelRepeat: (() => void)|null
  private _notification: Notification

  constructor(interval: number, parsingDelay: number, parsingDelayPerEA: number) {
    super()
    this._interval = interval
    this._parsingDelay = parsingDelay
    this._parsingDelayPerEA = parsingDelayPerEA
    this._running = false
    this._repeat = createRepeat()
    this._cancelRepeat = null
    this._notification = null
  }

  get running() {
    return this._running
  }

  get interval() {
    return this._interval
  }

  get parsingDelay() {
    return this._parsingDelay
  }

  get parsingDelayPerEA() {
    return this._parsingDelayPerEA
  }

  private _createToastString({ title, body, actions }: {
    title: string
    body: string
    actions: string[]
  }): string {
    const now = new Date().toLocaleTimeString()
    return createXMLString({
      toast: {
        $: {
          displayTimestamp: now,
          launch: 'mfl://',
          activationType: 'protocol'
        },
        audio: {
          $: {
            slient: 'true'
          }
        },
        visual: {
          binding: {
            $: {
              template: 'ToastGeneric'
            },
            text: [
              title,
              body,
            ]
          }
        },
        actions: {
          action: actions.map((text) => ({
            $: {
              content: text
            }
          }))
        }
      }
    })
  }

  async requestFindWantedItems(): Promise<AuctionWantedItemTuple[]> {
    const watches = getWatchesFromCategory()
    const newAdded: AuctionWantedItemTuple[] = []
    for (const watchData of watches) {
      await fetchAuctionItems(watchData.itemCategory)
      const categoryItems = getItems(watchData.itemCategory)
      let beforeIndex = categoryItems.length
      const queue = []
      while (categoryItems.length) {
        beforeIndex -= this._parsingDelayPerEA
        const buffer = categoryItems.splice(beforeIndex, this._parsingDelayPerEA)
        const filteredItems = getFilteredAuctionItems(buffer, watchData)
        queue.push(...filteredItems)
        await delay(this._parsingDelay)
      }
      const pending = addInspectQueue(watchData, queue)
      if (pending.length) {
        newAdded.push([watchData, pending])
      }
    }
    return newAdded
  }

  private _ensureNotification(): void {
    if (this._notification) {
      return
    }

    const soundFileName = 'notification.mp3'
    const soundFilePath = join(process.cwd(), 'resources', 'audio', soundFileName)

    this._notification = new Notification({
      silent: true
    }).on('show', () => {
      mainToRenderer('sound-play', soundFilePath)
    })
  }

  async alert(tuples: AuctionWantedItemTuple[]): Promise<void> {
    if (!tuples.length) {
      return
    }
    let count = 0
    for (const [watchData] of tuples) {
      count += changeItemInspectStage(
        watchData,
        AuctionWantedItemInspectStage.Alerted
      )
    }
    this._ensureNotification()

    const title = `경매장에 새로운 매물`
    const body = `조건에 일치하는 매물 ${count}개가 있습니다`

    // TODO: NOT WORKING IN WINDOWS NOW - USE LATER
    // const xml = this._createToastString({
    //   title,
    //   body,
    //   actions: []
    // })
    // this._notification.toastXml = xml

    this._notification.title = title
    this._notification.body = body
    this._notification.removeAllListeners('click')
    this._notification.once('click', () => {
      this.emit('notification-click', tuples)
    })
    this._notification.show()
  }

  run(): void {
    this.clear()
    this._running = true
    this._cancelRepeat = this._repeat(async () => {
      const newAddedTuples = await this.requestFindWantedItems()
      this.alert(newAddedTuples)
    }, this._interval, true)
  }

  clear(): void {
    if (this._cancelRepeat) {
      this._cancelRepeat()
      this._cancelRepeat = null
    }
    this._running = false
  }
}

export const auctionWatcher = new AuctionWatcher(
  AuctionWatcher.FetchInterval,
  AuctionWatcher.ParsingDelay,
  AuctionWatcher.ParsingDelayPerEA
)
