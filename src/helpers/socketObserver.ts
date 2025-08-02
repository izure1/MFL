import { EventEmitter } from 'node:events'
import { networkInterfaces } from 'node:os'
import sniff, { SocketPacket, SocketIp, SniffCallback } from 'raw-socket-sniffer'
import RemoteAddresses from '../config/socket/address.json' with { type: 'json' }

interface SocketObserverEvents {
  receive: [SocketPacket]
}

export class SocketObserver extends EventEmitter<SocketObserverEvents> {
  private static _Instance: SocketObserver
  static readonly RemoteAddresses = RemoteAddresses

  static GetInstance(): SocketObserver {
    if (!this._Instance) {
      this._Instance = new SocketObserver()
    }
    return this._Instance
  }

  private readonly _callbacks: SniffCallback[]
  private _started: boolean
  private _localIp: SocketIp

  constructor() {
    super()
    super.setMaxListeners(0)
    this._callbacks = []
  }

  get localIp(): SocketIp {
    if (this._localIp) {
      return this._localIp
    }
    this._localIp = this._getLocalIp()
    return this._localIp
  }

  private _getLocalIp(): SocketIp {
    const interfaces = networkInterfaces()
    let ip: SocketIp
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          ip = iface.address as SocketIp
          break
        }
      }
    }
    return ip
  }

  start(): void {
    if (this._started) {
      return
    }
    sniff(this.localIp, async (packet) => {
      const remoteAddresses = SocketObserver.RemoteAddresses
      for (const remoteAddress of remoteAddresses) {
        const from = packet.ipv4_header.src_addr
        if (!from.startsWith(remoteAddress)) {
          continue
        }
        for (const callback of this._callbacks) {
          callback(packet)
        }
      }
    })
    this._started = true
  }
}

export const socketObserver = SocketObserver.GetInstance()
