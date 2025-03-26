import { css } from '@emotion/react'
import CursorViewport from './CursorViewport.js'
import TimerViewport from './TimerViewport.js'

export default function Overlay() {
  return (
    <div css={css`
      width: 100%;
      height: 100%;
      position: fixed;
      top: 0;
      left: 0;
    `}>
      <CursorViewport />
      <TimerViewport reactionTime={1000} />
    </div>
  )
}
