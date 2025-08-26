import { useContext, useState } from 'react'
import { Box, Button, DialogContent,  DialogTitle, IconButton } from '@mui/material'
import { CloseRounded } from '@mui/icons-material'
import GlassDialog from './advanced/GlassDialog.js'
import OverlayActivateSwitch from './OverlayActivateSwitch.js'
import { ConfigContext } from './ConfigProvider.js'

export default function OverlayButton() {
  const [open, setOpen] = useState(false)
  const config = useContext(ConfigContext)

  return (
    <>
      <Button
        variant='text'
        size='large'
        disableElevation
        onClick={() => setOpen(true)}
      >게임 오버레이</Button>

      <GlassDialog
        open={open}
        onClose={() => setOpen(false)}
        fullScreen
        sx={{
          backdropFilter: 'blur(9px)',
          '& .MuiDialog-paper': {
            backgroundImage: 'none',
            backgroundColor: 'rgb(24, 24, 26)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display='flex' alignItems='center'>
            <div>게임 오버레이 설정</div>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton size='small' onClick={() => setOpen(false)}>
              <CloseRounded />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box py={1}>
            <OverlayActivateSwitch
              title={'현재 시각 표시'}
              description={'게임 내에서 현재 시각을 표시합니다'}
              configProperty={'clockActivate' as never}
              config={config}
            />
          </Box>
        </DialogContent>
      </GlassDialog>
    </>
  )
}
