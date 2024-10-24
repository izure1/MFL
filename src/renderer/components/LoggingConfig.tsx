import type { ConfigScheme } from '../../types/index.js'
import { Slider, Typography, Switch, Box } from '@mui/material'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { delay } from '../../utils/timer.js'
import { ipc } from '../ipc.js'
import LoggingConfigDirectory from './LoggingConfigDirectory.js'
import LoggingConfigManager from './LoggingConfigManager.js'

export default function LoggingConfig({
  config
}: {
  config: ConfigScheme
}) {
  const [pending, setPending] = useState(false)
  const working = useMemo(() => !pending && config.logging, [pending, config.logging])
  
  const marks = [
    { value: 5, label: '5초' },
    { value: 6, label: '6초' },
    { value: 7, label: '7초' },
    { value: 8, label: '8초' },
    { value: 9, label: '9초' },
    { value: 10, label: '10초' },
  ]

  async function requestLogging() {
    if (pending) {
      return
    }
    setPending(true)
    await ipc.app.logging()
    await delay(300)
    setPending(false)
  }

  async function handleChangeLogging(_e: ChangeEvent, logging: boolean) {
    await ipc.config.set({ logging })
    await requestLogging()
  }

  async function handleChangeLoggingInterval(_e: Event, loggingInterval: number) {
    await ipc.config.set({ loggingInterval })
  }

  useEffect(() => {
    ipc.app.logging()
  }, [])

  return (
    <>
      <div>
        <Box
          display='flex'
          flexDirection='row'
          alignItems='center'
        >
          <Typography variant='h5' color={ config.logging ? 'rgb(225, 173, 145)' : 'primary.dark' }>스냅샷 기록하기</Typography>
          <Switch
            checked={config.logging}
            onChange={handleChangeLogging}
            disabled={pending}
          />
          <LoggingConfigDirectory config={config} />
          <LoggingConfigManager config={config} />
        </Box>
        <Typography variant='body1' color='rgb(230, 230, 230)'>
          { working ?
          '현재 기록 중입니다. 스냅샷은 지정한 폴더에 저장됩니다.' :
          '게임 활성화 시 플레이화면을 찍어 보관합니다.' }
        </Typography>
      </div>
      <div>
        <Typography variant='h5' color='rgb(225, 173, 145)'>기록 간격</Typography>
        <Typography variant='body1' color='rgb(230, 230, 230)'>5 ~ 10초 사이로 값을 설정할 수 있습니다.</Typography>
        <Slider
          value={config.loggingInterval}
          step={1}
          min={5}
          max={10}
          marks={marks}
          valueLabelDisplay='auto'
          onChange={handleChangeLoggingInterval}
        />
      </div>
    </>
  )
}
