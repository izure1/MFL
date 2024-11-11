import { useState } from 'react'
import { Box, Button, DialogContent,  DialogTitle } from '@mui/material'
import GlassDialog from './advanced/GlassDialog.js'

export default function CronJobButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant='text'
        size='large'
        disableElevation
        onClick={() => setOpen(true)}
      >작업</Button>

      <GlassDialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        sx={{
          backdropFilter: 'blur(9px)',
          '& .MuiDialog-paper': {
            backgroundImage: 'none',
            backgroundColor: 'rgb(24, 24, 26)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>작업 목록</DialogTitle>
        <DialogContent>
          <Box py={1}>
            {/* <Auction /> */}
          </Box>
        </DialogContent>
      </GlassDialog>
    </>
  )
}
