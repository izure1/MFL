import type { ConfigScheme } from '../../types/index.js'
import { Typography, Box } from '@mui/material'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { ipc } from '../ipc.js'
import CursorConfigCustom from './CursorConfigCustom.js'
import NeonSignText from './advanced/NeonSignText.js'
import Android12Switch from './advanced/Android12Switch.js'

export default function CursorConfig({
  config
}: {
  config: ConfigScheme
}) {
  const [pending, setPending] = useState(false)
  const working = useMemo(() => config.cursorRunning, [config.cursorRunning])

  async function handleChangeRunning(_e: ChangeEvent, cursorRunning: boolean) {
    if (pending) {
      return
    }
    setPending(true)
    await ipc.config.set({ cursorRunning })
    setPending(false)
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
            disabled={!config.cursorRunning}
          >
            마우스 강조
          </NeonSignText>
          <Android12Switch
            checked={config.cursorRunning}
            onChange={handleChangeRunning}
            disabled={pending}
          />
          <CursorConfigCustom config={config} />
        </Box>
        <Typography variant='body1' color='rgb(230, 230, 230)'>
          { working ?
          '현재 마우스 강조를 사용 중입니다!' :
          '활성화 시 게임 내에서 마우스 위치를 강조합니다.' }
        </Typography>
      </div>
    </>
  )
}
