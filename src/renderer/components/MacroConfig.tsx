import type { ConfigScheme } from '../../types/index.js'
import { Typography, Switch, Box } from '@mui/material'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { delay } from '../../utils/timer.js'
import { ipc } from '../ipc.js'

export default function MacroConfig({
  config
}: {
  config: ConfigScheme
}) {
  const [pending, setPending] = useState(false)
  const working = useMemo(() => config.macroRunning, [config.macroRunning])

  async function request() {
    if (pending) {
      return
    }
    setPending(true)
    await ipc.app.limit()
    await delay(300)
    setPending(false)
  }

  async function handleChangeRunning(_e: ChangeEvent, macroRunning: boolean) {
    await ipc.config.set({ macroRunning })
    await request()
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
          <Typography variant='h5' color={ config.macroRunning ? 'rgb(225, 173, 145)' : 'primary.dark' }>매크로 실행</Typography>
          <Switch
            checked={config.macroRunning}
            onChange={handleChangeRunning}
            disabled={pending}
          />
        </Box>
        <Typography variant='body1' color='rgb(230, 230, 230)'>
          { working ?
          '현재 매크로를 사용 중입니다!' :
          '활성화 시 게임 내에서 매크로를 사용합니다.' }
        </Typography>
      </div>
    </>
  )
}
