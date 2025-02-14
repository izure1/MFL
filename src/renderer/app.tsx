import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import { ThemeProvider } from '@emotion/react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router'
import { theme } from './theme.js'
import AppBar from './bar.js'
import MabinogiDetectorProvider from './components/DetectorProvider.js'
import ConfigProvider from './components/ConfigProvider.js'
import MacroProvider from './components/MacroProvider.js'
import AuctionWatchProvider from './components/AuctionWatchProvider.js'
import Main from './components/main.js'
import Overlay from './components/overlay/Overlay.js'
import { Box } from '@mui/material'

import { ipc } from './ipc.js'
import { useEffect } from 'react'

function onSetHash() {
  ipc.app.onSetHash((hash) => {
    window.location.hash = hash
  })
}

function App() {
  useEffect(onSetHash, [])

  return (
    <ThemeProvider theme={theme}>
      <MabinogiDetectorProvider>
        <ConfigProvider>
          <MacroProvider>
            <AuctionWatchProvider>
              <HashRouter>
                <Routes>
                  <Route path='main' element={(
                    <Box
                      width='100%'
                      height='100%'
                      display='flex'
                      flexGrow={1}
                      flexShrink={1}
                      flexDirection='column'
                    >
                      <AppBar />
                      <Main />
                    </Box>
                  )} />
                  <Route path='overlay' element={<Overlay />} />
                </Routes>
              </HashRouter>
            </AuctionWatchProvider>
          </MacroProvider>
        </ConfigProvider>
      </MabinogiDetectorProvider>
    </ThemeProvider>
  )
}

const root = createRoot(document.querySelector('#app'))
root.render(<App />)
