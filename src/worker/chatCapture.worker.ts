import { NodeWinPcap } from 'node-win-pcap'
import RemoteAddresses from '../config/socket/address.json' with { type: 'json' }

interface ChatMessage {
  nickname: string
  message: string
}

function parseChat(buffer: Buffer): ChatMessage|null {
  // 'Rl' (82, 108) 위치 찾기
  const rlIndex = buffer.indexOf(Buffer.from([82, 108]))
  if (rlIndex === -1) {
    return null
  }

  // 닉네임 필드 시작 위치 찾기: 0, 6, 0
  const field1Start = buffer.indexOf(Buffer.from([0, 6, 0]), rlIndex + 2)
  if (field1Start === -1) {
    return null
  }
  const length1 = buffer[field1Start + 3]   // 길이 (16)
  const str1Start = field1Start + 4         // 닉네임 데이터 시작
  const str1End = str1Start + (length1 - 1) // 실제 데이터 길이 (15)
  const nickname = buffer.subarray(str1Start, str1End).toString('utf8')

  // 메시지 필드 시작 위치 찾기: 6, 0
  const field2Start = buffer.indexOf(Buffer.from([6, 0]), str1End)
  if (field2Start === -1) {
    return null
  }
  const length2 = buffer[field2Start + 2]   // 길이 (10)
  const str2Start = field2Start + 3         // 메시지 데이터 시작
  const str2End = str2Start + (length2 - 1) // 실제 데이터 길이 (9)
  const message = buffer.subarray(str2Start, str2End).toString('utf8')

  return {
    nickname: nickname,
    message: message,
  }
}

// Pass the ipAddress to the constructor
const sniffer = new NodeWinPcap() // Example: Sniff on loopback interface

sniffer.on('packet', (packet) => {
  // The parsed IP header is now available
  // const chat = parseChat(packet.data)
  // if (chat === null) {
  //   return
  // }
  process.send(packet.ipHeader)
  // console.log(chat)
})

sniffer.on('error', (err) => {
  console.error('Sniffer Error:', err)
})

// Start sniffing with filters passed directly to the start method
const sourceFilter = RemoteAddresses.Chat // Example: Capture all local traffic
const destFilter = NodeWinPcap.GetLocalAddress() // Example: No filter on destination

sniffer.start(sourceFilter, destFilter)
