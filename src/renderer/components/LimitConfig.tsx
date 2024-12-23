import type { ConfigScheme } from '../../types/index.js'
import { Slider, Typography, Switch, Box } from '@mui/material'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { delay } from '../../utils/timer.js'
import { ipc } from '../ipc.js'

export default function LimitConfig({
  config
}: {
  config: ConfigScheme
}) {
  const [pending, setPending] = useState(false)
  const working = useMemo(() => !pending && config.running, [pending, config.running])

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

  async function handleChangeLimit(_e: Event, limit: number) {
    await ipc.config.set({ limit })
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
          <Typography variant='h5' color={ config.running ? 'rgb(225, 173, 145)' : 'primary.dark' }>성능 제한 및 매크로 동작하기</Typography>
          <Switch
            checked={config.running}
            onChange={handleChangeRunning}
            disabled={pending}
          />
        </Box>
        <Typography variant='body1' color='rgb(230, 230, 230)'>
          { working ?
          '현재 동작 중입니다!' :
          '게임 비활성화 시 성능을 제한하며, 활성화 시 매크로가 동작합니다.' }
        </Typography>
      </div>
      <div>
        <Typography variant='h5' color='rgb(225, 173, 145)'>성능 제한</Typography>
        <Typography variant='body1' color='rgb(230, 230, 230)'>5 ~ 95% 사이로 값을 설정할 수 있습니다.</Typography>
        <Slider
          value={config.limit}
          step={1}
          min={5}
          max={95}
          valueLabelDisplay='auto'
          onChange={handleChangeLimit}
        />
      </div>
    </>
  )
}
