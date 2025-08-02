declare module 'raw-socket-sniffer' {
  export type SocketIp = `${string}.${string}.${string}.${string}`
  export interface SocketPacket {
    ethernet_header: {
      mac_addr_dst: '00:00:00:00:00:00' // fake, always zeros
      mac_addr_src: '00:00:00:00:00:00' // fake, always zeros
      eth_type: 8 // always 8
    }
    ipv4_header: {
      ip_version_number: 4 // always 4
      ihl: number
      bytes_length: number
      service_type: number
      total_length: number
      id: number
      flags: string
      fragment_offset: number // incorrect due to unfixed bug in parse_ipv4.js
      time_to_live: number
      protocol: 'UDP'|'TCP'
      header_checksum: number
      src_addr: SocketIp
      dst_addr: SocketIp
    }
    packet_header: {
      port_src: 5353
      port_dst: 5353
      length: 69
      checksum: 11246
    } // only UDP packets are parsed
    payload: Buffer
  }
  export type SniffCallback = (packet: SocketPacket) => Promise<void>

  export default function sniff(targetIp: SocketIp, callback: SniffCallback): void
}
