import { css } from '@emotion/react'
import { forwardRef } from 'react'

interface CursorComponentProps {
  cursorThickness: number
  cursorSize: number
  cursorColor: string
}

export default forwardRef<HTMLDivElement, CursorComponentProps>(({
  cursorColor,
  cursorSize,
  cursorThickness
}, ref) => {
  return (
    <div
      ref={ref}
      css={css`
        width: ${cursorSize}px;
        height: ${cursorSize}px;
        position: relative;
        background-color: transparent;
        box-sizing: border-box;
        top: 0;
        left: 0;
        border: ${cursorThickness}px solid ${cursorColor};
        border-radius: calc(1px / 0);
        pointer-events: none;
      `}
    />
  )
})
