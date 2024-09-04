import { css } from '@emotion/react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import HomeButton from './components/HomeButton'
import AboutButton from './components/AboutButton'
import MacroButton from './components/MacroButton'
import IconButton from '@mui/material/IconButton'
import Minimize from '@mui/icons-material/Minimize'
import Button from '@mui/material/Button'
import Close from '@mui/icons-material/Close'

import { ipc } from './ipc'
import LogoImage from './assets/img/logo.png'

export default function Titlebar() {
  function handleMinimize() {
    ipc.app.minimize()
  }

  function handleClose() {
    ipc.app.close()
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
            <IconButton size='medium' onClick={handleClose}>
              <Close />
            </IconButton>
          </div>
        </div>
      </Toolbar>
    </AppBar>
  )
}
