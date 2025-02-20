import { useContext, useMemo, useState } from 'react'
import { Badge, Box, Button, DialogContent,  DialogTitle, IconButton } from '@mui/material'
import { CloseRounded } from '@mui/icons-material'
import Auction from './auction/Auction.js'
import { AuctionWatchContext } from './AuctionWatchProvider.js'
import GlassDialog from './advanced/GlassDialog.js'

export default function AboutButton() {
  const [open, setOpen] = useState(false)
  const { nonInspectedItems } = useContext(AuctionWatchContext)

  const badgeInvisible = useMemo(() => !nonInspectedItems.length, [
    nonInspectedItems
  ])

  return (
    <>
      <Badge
        variant='dot'
        color='warning'
        invisible={badgeInvisible}
        sx={{
          '& .MuiBadge-badge': {
            transform: 'translate(-2px, 2px)'
          }
        }}
      >
        <Button
          variant='text'
          size='large'
          disableElevation
          onClick={() => setOpen(true)}
        >경매장</Button>
      </Badge>

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
            <div>마비노기 경매장 검색 알리미</div>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton size='small' onClick={() => setOpen(false)}>
              <CloseRounded />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box py={1}>
            <Auction />
          </Box>
        </DialogContent>
      </GlassDialog>
    </>
  )
}
