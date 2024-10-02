import { css } from '@emotion/react'
import { useState } from 'react'
import { AppBar, Button, Toolbar, IconButton } from '@mui/material'
import { Minimize, Close } from '@mui/icons-material'
import HomeButton from './components/HomeButton.js'
import AboutButton from './components/AboutButton.js'
import MacroButton from './components/MacroButton.js'

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
        <div css={css`
          display: flex;
          flex: 1 1;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        `}>
          <div css={css`
            display: flex;
            align-items: center;
          `}>
            <Button onClick={async () => openExternal('https://mabinogi.nexon.com/')}>
              <img
                src={LogoImage}
                css={css`
                  height: 30px;
                `}
              />
            </Button>
            <HomeButton />
            <MacroButton />
            <AboutButton />
          </div>
          <div css={css`
            display: flex;
            gap: 5px;
          `}>
            <IconButton size='medium' onClick={handleMinimize}>
              <Minimize />
            </IconButton>
            <IconButton size='medium' onClick={handleClose} disabled={closing}>
              <Close />
            </IconButton>
          </div>
        </div>
      </Toolbar>
    </AppBar>
  )
}
