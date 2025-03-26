import { css } from '@emotion/react'
import { useState } from 'react'
import { AppBar, Button, Toolbar, IconButton, Box } from '@mui/material'
import { Minimize, Close } from '@mui/icons-material'
import HomeButton from './components/HomeButton.js'
import AboutButton from './components/AboutButton.js'
import MacroButton from './components/MacroButton.js'
import CronJobButton from './components/CronJobButton.js'
import AuctionButton from './components/AuctionButton.js'
import OverlayButton from './components/OverlayButton.js'

import { ipc } from './ipc.js'
import LogoImage from './assets/img/logo.png'

export default function Titlebar() {
  const [closing, setClosing] = useState(false)

  function handleMinimize() {
    ipc.app.minimize()
  }

  function handleClose() {
    if (closing) {
      return
    }
    ipc.app.close()
    setClosing(true)
  }

  async function openExternal(url: string) {
    ipc.external.open(url)
  }

  return (
    <AppBar position="static" className='titlebar' sx={{ boxShadow: 0 }}>
      <Toolbar variant="dense" sx={{
        '&.MuiToolbar-root': {
          pr: 1
        }
      }}>
        <Box
          display='flex'
          flexGrow={1}
          flexShrink={1}
          flexDirection='row'
          justifyContent='space-between'
          alignItems='center'
        >
          <Box
            display='flex'
            alignItems='center'
          >
            <Button onClick={async () => openExternal('https://mabinogi.nexon.com/')}>
              <img
                src={LogoImage}
                css={css`
                  height: 30px;
                `}
              />
            </Button>
            <HomeButton />
            {/* <CronJobButton /> */}
            <AuctionButton />
            <OverlayButton />
            <AboutButton />
          </Box>
          <Box
            display='flex'
            gap={1}
          >
            <IconButton size='medium' onClick={handleMinimize}>
              <Minimize />
            </IconButton>
            <IconButton size='medium' onClick={handleClose} disabled={closing}>
              <Close />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
