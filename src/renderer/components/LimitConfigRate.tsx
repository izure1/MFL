import type { ConfigScheme } from '../../types/index.js'
import { useState } from 'react'
import { Box, Button, DialogContent, DialogContentText, DialogTitle, Slider } from '@mui/material'
import { ipc } from '../ipc.js'
import BlurDialog from './advanced/BlurDialog.js'

export default function LimitConfigRate({
  config
}: {
  config: ConfigScheme
}) {
  const [configOpen, setConfigOpen] = useState(false)

  const marks = [
    { value: 5, label: '5%' },
    { value: 25, label: '25%' },
    { value: 50, label: '50%' },
    { value: 75, label: '75%' },
    { value: 95, label: '95%' },
  ]

  function handleChange() {
    setConfigOpen(true)
  }

  function handleClose() {
    setConfigOpen(false)
  }

  async function handleChangeLimit(_e: Event, limit: number) {
    await ipc.config.set({ limit })
  }

  return (
    <>
      <BlurDialog
        open={configOpen}
        onClose={handleClose}
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle>제한 수치 설정</DialogTitle>
        <DialogContent>
          <DialogContentText>
            5 ~ 95% 사이로 값을 설정할 수 있습니다.
            <br />
            너무 높은 값을 설정하면 게임이 멈출 수 있습니다.
          </DialogContentText>
          <Box mt={2}>
            <Slider
              value={config.limit}
              step={1}
              min={5}
              max={95}
              marks={marks}
              valueLabelDisplay='auto'
              onChange={handleChangeLimit}
            />
          </Box>
        </DialogContent>
      </BlurDialog>
      <Button
        size='small'
        disableElevation
        sx={{
          marginLeft: 2
        }}
        onClick={handleChange}
      >제한 수치 설정</Button>
    </>
  )
}
