import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import { ThemeProvider, css } from '@emotion/react'
import { createRoot } from 'react-dom/client'
import { theme } from './theme.js'
import AppBar from './bar.js'
import MabinogiDetectorProvider from './components/DetectorProvider.js'
import ConfigProvider from './components/ConfigProvider.js'
import MacroProvider from './components/MacroProvider.js'
import Main from './components/main.js'

function App() {
  return (
    <MabinogiDetectorProvider>
      <ConfigProvider>
        <MacroProvider>
          <ThemeProvider theme={theme}>
            <div className='wrapper' css={css`
              width: 100%;
              height: 100%;
              display: flex;
              flex: 1 1;
              flex-direction: column;
            `}>
              <AppBar />
              <Main />
            </div>
          </ThemeProvider>
        </MacroProvider>
      </ConfigProvider>
    </MabinogiDetectorProvider>
  )
}

const root = createRoot(document.querySelector('#app'))
root.render(<App />)
