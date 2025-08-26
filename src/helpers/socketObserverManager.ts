import { NodeWinPcap } from 'node-win-pcap'
import RemoteAddresses from '../config/socket/address.json' with { type: 'json' }

class SocketObserver extends NodeWinPcap {
  readonly remoteAddressProperty: keyof typeof RemoteAddresses
  readonly remoteAddress: string
  readonly localAddress: string

  constructor(property: keyof typeof RemoteAddresses) {
    super(NodeWinPcap.GetLocalAddress(), { socketSize: 1024*8 })
    this.setMaxListeners(0)
    this.remoteAddressProperty = property
    this.remoteAddress = RemoteAddresses[property]
    this.localAddress = NodeWinPcap.GetLocalAddress()
  }

  start(): this {
    if (this.isListening) {
      return this
    }
    super.start(this.remoteAddress, this.localAddress)
    return this
  }

  stop(): this {
    if (!this.isListening) {
      return this
    }
    super.stop()
    return this
  }
}

class SocketObserverManager {
  private static _Instance: SocketObserverManager

  static GetInstance(): SocketObserverManager {
    if (!this._Instance) {
      this._Instance = new SocketObserverManager()
    }
    return this._Instance
  }

  private readonly _instances: Record<keyof typeof RemoteAddresses, SocketObserver>

  constructor() {
    this._instances = {} as Record<keyof typeof RemoteAddresses, SocketObserver>
  }

  getObserver(property: keyof typeof RemoteAddresses): SocketObserver {
    if (!Object.hasOwn(this._instances, property)) {
      this._instances[property] = new SocketObserver(property)
    }
    return this._instances[property]
  }
}

export const socketObserverManager = SocketObserverManager.GetInstance()
