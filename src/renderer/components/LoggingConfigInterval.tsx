import type { ConfigScheme } from '../../types/index.js'
import { useState } from 'react'
import { Box, Button, DialogContent, DialogContentText, DialogTitle, Slider } from '@mui/material'
import { ipc } from '../ipc.js'
import BlurDialog from './advanced/BlurDialog.js'
import { createDebounce } from '../../utils/timer.js'

export default function LoggingConfigInterval({
  config
}: {
  config: ConfigScheme
}) {
  const debounce = createDebounce(100)
  const [loggingInterval, setLoggingInterval] = useState(config.loggingInterval)
  const [configOpen, setConfigOpen] = useState(false)

  const marks = [
    { value: 1, label: '1초' },
    { value: 2, label: '2초' },
    { value: 3, label: '3초' },
    { value: 4, label: '4초' },
    { value: 5, label: '5초' },
    { value: 6, label: '6초' },
    { value: 7, label: '7초' },
    { value: 8, label: '8초' },
    { value: 9, label: '9초' },
    { value: 10, label: '10초' },
  ]

  function handleChange() {
    setConfigOpen(true)
  }

  function handleClose() {
    setConfigOpen(false)
  }

  function handleChangeLoggingInterval(_e: Event, loggingInterval: number) {
    setLoggingInterval(loggingInterval)
    debounce.execute('config', () => ipc.config.set({ loggingInterval }))
  }

  return (
    <>
      <BlurDialog
        open={configOpen}
        onClose={handleClose}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>기록 간격</DialogTitle>
        <DialogContent>
          <DialogContentText>
            1 ~ 10초 사이로 값을 설정할 수 있습니다.
            <br />
            일상적인 대화 로그를 녹취하길 바란다면, 5 ~ 7초를 권장합니다.
            <br />
            던전에서는 1 ~ 2초를 권장합니다.
          </DialogContentText>
          <Box mt={2}>
            <Slider
              defaultValue={config.loggingInterval}
              value={loggingInterval}
              step={1}
              min={1}
              max={10}
              marks={marks}
              valueLabelDisplay='auto'
              onChange={handleChangeLoggingInterval}
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
      >기록 간격</Button>
    </>
  )
}
