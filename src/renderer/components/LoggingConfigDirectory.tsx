import type { ConfigScheme } from '../../types/index.js'
import { useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material'
import { getLoggingDistDirectory } from '../../helpers/logger.js'
import { ipc } from '../ipc.js'

export default function LoggingConfigDirectory({
  config
}: {
  config: ConfigScheme
}) {
  const [configOpen, setConfigOpen] = useState(false)

  function handleChange() {
    setConfigOpen(true)
  }

  function handleClose() {
    setConfigOpen(false)
  }

  async function handleOpenDirectory() {
    await ipc.external.showItem(config.loggingDirectory)
  }

  async function handleChangeDirectory() {
    const { canceled, filePaths } = await ipc.fs.showOpenDialog({
      title: '스냅샷이 저장될 위치를 선택해주세요',
      defaultPath: config.loggingDirectory,
      properties: [
        'openDirectory'
      ]
    })
    const loggingDirectory = filePaths.pop()
    if (canceled || !loggingDirectory) {
      return
    }
    await ipc.config.set({ loggingDirectory })
  }

  return (
    <>
      <Dialog
        open={configOpen}
        onClose={handleClose}
        maxWidth='lg'
      >
        <DialogTitle>{getLoggingDistDirectory(config.loggingDirectory)}</DialogTitle>
        <DialogContent>
          <div>
            {
              [
                '스냅샷이 보관될 위치입니다.',
                '남은 용량이 충분한 저장공간 내 위치를 선택해주세요.'
              ].map((text) => (
                <Typography key={text} fontSize={16}>{text}</Typography>
              ))
            }
          </div>
        </DialogContent>
        <DialogActions sx={{
          justifyContent: 'center'
        }}>
          <Button onClick={handleOpenDirectory}>열기</Button>
          <Button onClick={handleChangeDirectory}>변경</Button>
        </DialogActions>
      </Dialog>
      <Button
        size='small'
        disableElevation
        sx={{
          marginLeft: 2
        }}
        onClick={handleChange}
      >저장 위치</Button>
    </>
  )
}
