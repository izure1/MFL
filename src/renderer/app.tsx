import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import { ThemeProvider, css } from '@emotion/react'
import { createRoot } from 'react-dom/client'
import { theme } from './theme'
import AppBar from './bar'
import MabinogiDetectorProvider from './components/DetectorProvider'
import MacroProvider from './components/MacroProvider'
import Main from './components/main'

function App() {
  return (
    <MabinogiDetectorProvider>
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
    </MabinogiDetectorProvider>
  )
}

const root = createRoot(document.querySelector('#app'))
root.render(<App />)
