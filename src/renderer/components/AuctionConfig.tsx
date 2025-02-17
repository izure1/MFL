import type { ConfigScheme } from '../../types/index.js'
import { Typography, Switch, Box } from '@mui/material'
import { ChangeEvent, useMemo } from 'react'
import { ipc } from '../ipc.js'
import { NeonSignText } from './advanced/NeonSignText.js'

export default function AuctionConfig({
  config
}: {
  config: ConfigScheme
}) {
  const working = useMemo(() => config.auctionWatching, [config.auctionWatching])

  async function handleChangeWatching(_e: ChangeEvent, auctionWatching: boolean) {
    await ipc.config.set({ auctionWatching })
  }

  return (
    <>
      <div>
        <Box
          display='flex'
          flexDirection='row'
          alignItems='center'
        >
          <NeonSignText
            color={'primary.dark'}
            variant={'h5'}
            disabled={!config.auctionWatching}
          >
            경매장 알림
          </NeonSignText>
          <Switch
            checked={config.auctionWatching}
            onChange={handleChangeWatching}
          />
        </Box>
        <Typography variant='body1' color='rgb(230, 230, 230)'>
          { working ?
          '현재 경매장 알림을 활성화하였습니다.' :
          '경매장에서 아이템이 등록되었을 때 알림을 받습니다. 게임 성능을 위해 던전을 돌 땐 꺼두는게 좋습니다.' }
        </Typography>
      </div>
    </>
  )
}
