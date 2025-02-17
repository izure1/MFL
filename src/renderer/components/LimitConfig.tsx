import type { ConfigScheme } from '../../types/index.js'
import { Typography, Switch, Box } from '@mui/material'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { delay } from '../../utils/timer.js'
import { ipc } from '../ipc.js'
import LimitConfigRate from './LimitConfigRate.js'
import { NeonSignText } from './advanced/NeonSignText.js'

export default function LimitConfig({
  config
}: {
  config: ConfigScheme
}) {
  const [pending, setPending] = useState(false)
  const working = useMemo(() => config.running, [config.running])

  async function requestLimit() {
    if (pending) {
      return
    }
    setPending(true)
    await ipc.app.limit()
    await delay(300)
    setPending(false)
  }

  async function handleChangeRunning(_e: ChangeEvent, running: boolean) {
    await ipc.config.set({ running })
    await requestLimit()
  }

  useEffect(() => {
    ipc.app.limit()
  }, [])

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
            disabled={!config.running}
          >
            게임 성능 제한
          </NeonSignText>
          <Switch
            checked={config.running}
            onChange={handleChangeRunning}
            disabled={pending}
          />
          <LimitConfigRate config={config} />
        </Box>
        <Typography variant='body1' color='rgb(230, 230, 230)'>
          { working ?
          '현재 성능 제한 중입니다!' :
          '활성화 시 게임 중이 아니면 성능을 제한합니다.' }
        </Typography>
      </div>
    </>
  )
}
