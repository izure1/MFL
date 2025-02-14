import { css } from '@emotion/react'
import CursorViewport from './CursorViewport.js'

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
    </div>
  )
}
