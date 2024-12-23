import { useContext } from 'react'
import LimitConfig from './LimitConfig.js'
import LoggingConfig from './LoggingConfig.js'
import AuctionConfig from './AuctionConfig.js'
import { ConfigContext } from './ConfigProvider.js'
import { Box } from '@mui/material'

export default function Config() {
  const config = useContext(ConfigContext)

  return (
    <div>
      { config && (
        <Box
          padding={3}
          display='flex'
          flexDirection='column'
          gap={3}
        >
          <LimitConfig config={config} />
          <LoggingConfig config={config} />
          <AuctionConfig config={config} />
        </Box>
      ) }
    </div>
  )
}
