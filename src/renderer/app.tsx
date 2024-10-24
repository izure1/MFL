import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import { ThemeProvider } from '@emotion/react'
import { createRoot } from 'react-dom/client'
import { theme } from './theme.js'
import AppBar from './bar.js'
import MabinogiDetectorProvider from './components/DetectorProvider.js'
import ConfigProvider from './components/ConfigProvider.js'
import MacroProvider from './components/MacroProvider.js'
import AuctionWatchProvider from './components/AuctionWatchProvider.js'
import Main from './components/main.js'
import { Box } from '@mui/material'

function App() {
  return (
    <MabinogiDetectorProvider>
      <ConfigProvider>
        <MacroProvider>
          <ThemeProvider theme={theme}>
            <AuctionWatchProvider>
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
            </AuctionWatchProvider>
          </ThemeProvider>
        </MacroProvider>
      </ConfigProvider>
    </MabinogiDetectorProvider>
  )
}

const root = createRoot(document.querySelector('#app'))
root.render(<App />)
