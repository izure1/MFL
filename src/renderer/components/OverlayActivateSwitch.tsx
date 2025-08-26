import type { MatchedProperties, ConfigScheme } from '../../types/index.js'
import { Box, FormControlLabel, Tooltip } from '@mui/material'
import React, { ChangeEvent, forwardRef, useMemo } from 'react'
import { ipc } from '../ipc.js'
import Android12Switch from './advanced/Android12Switch.js'
import NeonSignText from './advanced/NeonSignText.js'

interface OverlayActivateSwitchProps {
  title: React.ReactNode
  description: React.ReactNode
  configProperty: MatchedProperties<ConfigScheme, boolean>
  config: ConfigScheme
}

export default forwardRef<HTMLDivElement, OverlayActivateSwitchProps>(({
  title,
  description,
  configProperty,
  config,
}, ref) => {
  const disabled = useMemo(() => !config[configProperty], [config[configProperty]])
  
  function handleChangeConfig(_e: ChangeEvent<HTMLInputElement>, activate: boolean) {
    ipc.config.set({ [configProperty]: activate })
  }

  return (
    <div ref={ref}>
      <Tooltip title={description} placement={'right'}>
        <FormControlLabel
          sx={{ ml: 1 }}
          label={
            <NeonSignText
              variant={'h6'}
              color={'primary.dark'}
              disabled={disabled}
            >
              <Box marginLeft={2}>{title}</Box>
            </NeonSignText>
          }
          control={(
            <Android12Switch
              size={'medium'}
              checked={config[configProperty] as any}
              onChange={handleChangeConfig}
            />
          )}
        />
      </Tooltip>
    </div>
  )
})
