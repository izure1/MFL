import { css } from '@emotion/react'
import { forwardRef, useContext } from 'react'
import Timer, { type TimerProps } from './Timer.js'
import { ConfigContext } from '../ConfigProvider.js'

export interface TimerViewportProps extends TimerProps {
  reactionTime: number
}

export default forwardRef<HTMLDivElement, TimerViewportProps>(({
  reactionTime,
}, ref) => {
  const config = useContext(ConfigContext)

  return (
    config && config.clockActivate && (
      <div css={css`
        position: fixed;
        pointer-events: none;
        bottom: 5%;
        left: 5%;
      `}>
        <Timer reactionTime={reactionTime} />
      </div>
    )
  )
})
