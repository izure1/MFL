import { useState } from 'react'
import { Box, Button, DialogContent,  DialogTitle } from '@mui/material'
import GlassDialog from './advanced/GlassDialog.js'
import AuctionDistributor from './AuctionDistributor.js'

export default function AuctionDistributorButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant='text'
        size='large'
        disableElevation
        onClick={() => setOpen(true)}
      >유틸</Button>

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
        <DialogTitle sx={{ pb: 1 }}>아이템 분배 계산기</DialogTitle>
        <DialogContent>
          <Box py={1}>
            <AuctionDistributor />
          </Box>
        </DialogContent>
      </GlassDialog>
    </>
  )
}
