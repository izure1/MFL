import { css } from '@emotion/react'
import { useContext } from 'react'
import LimitConfig from './LimitConfig.js'
import LoggingConfig from './LoggingConfig.js'
import { ConfigContext } from './ConfigProvider.js'

export default function Config() {
  const config = useContext(ConfigContext)

  return (
    <div>
      { config && (
        <div css={css`
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 30px;
        `}>
          <LimitConfig config={config} />
          <LoggingConfig config={config} />
        </div>
      ) }
    </div>
  )
}
