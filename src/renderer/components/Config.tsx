import { useContext } from 'react'
import LimitConfig from './LimitConfig.js'
import MacroConfig from './MacroConfig.js'
import CursorConfig from './CursorConfig.js'
import LoggingConfig from './LoggingConfig.js'
import AuctionConfig from './AuctionConfig.js'
import { ConfigContext } from './ConfigProvider.js'
import { Box, Grid } from '@mui/material'

export default function Config() {
  const config = useContext(ConfigContext)

  return (
    <div>
      { config && (
        <Box
          padding={3}
          display='flex'
          flexDirection='column'
          gap={5}
        >
          <LimitConfig config={config} />
          <Grid container>
            <Grid item xs={5}>
              <MacroConfig config={config} />
            </Grid>
            <Grid item>
              <CursorConfig config={config} />
            </Grid>
          </Grid>
          <LoggingConfig config={config} />
          <AuctionConfig config={config} />
        </Box>
      ) }
    </div>
  )
}
