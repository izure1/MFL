import { css } from '@emotion/react'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'

import { ipc } from '../ipc'
import { delay } from '../../utils/timer'
import { ConfigScheme } from 'src/types'

export default function Config() {
  const [config, setConfig] = useState<ConfigScheme>({ limit: 50, running: false })
  const [pending, setPending] = useState(false)
  const working = useMemo(() => !pending && config.running, [pending, config.running])

  async function fetchConfig() {
    const raw = await ipc.config.get()
    setConfig(raw)
  }

  async function requestLimit() {
    if (pending) {
      return
    }
    setPending(true)
    const success = await ipc.app.limit()
    await delay(1000)
    if (!success) {
      const newConfig = { ...config, running: false }
      setConfig(newConfig)
    }
    setPending(false)
  }

  async function handleChangeRunning(_e: ChangeEvent, running: boolean) {
    const newConfig = { ...config, running }
    setConfig(newConfig)
    await ipc.config.set(newConfig)
    await requestLimit()
  }

  async function handleChangeLimit(_e: Event, limit: number) {
    const newConfig = { ...config, limit }
    setConfig(newConfig)
    await ipc.config.set(newConfig)
  }

  useEffect(() => {
    fetchConfig().then(requestLimit)
  }, [])

  return (
    <div>
      { config && (
        <div css={css`
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 30px;
        `}>
          <div>
            <div css={css`
              display: flex;
              flex-direction: row;
              align-items: center;
            `}>
              <Typography variant='h5' color={ config.running ? 'rgb(225, 173, 145)' : 'primary.dark' }>시작하기</Typography>
              <Switch
                checked={config.running}
                onChange={handleChangeRunning}
                disabled={pending}
              />
            </div>
            <Typography variant='body1' color='rgb(230, 230, 230)'>
              { working ?
              '현재 동작 중입니다!' :
              '마비노기가 백그라운드일 때, 성능을 제한합니다.' }
            </Typography>
          </div>
          <div>
            <Typography variant='h5' color='rgb(225, 173, 145)'>성능 제한</Typography>
            <Typography variant='body1' color='rgb(230, 230, 230)'>0 ~ 99% 사이로 값을 설정할 수 있습니다.</Typography>
            <Slider
              value={config.limit}
              step={1}
              min={0}
              max={99}
              valueLabelDisplay='auto'
              onChange={handleChangeLimit}
            />
          </div>
        </div>
      ) }
    </div>
  )
}
