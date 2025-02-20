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
        box-sizing: border-box;
        border-radius: calc(1px / 0);
        background: transparent;
        top: 0;
        left: 0;
        pointer-events: none;

        &::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: ${cursorThickness}px; /* 테두리 두께 */
          border-radius: calc(1px / 0); /* 요소의 radius보다 1px 크게 설정 */
          background: ${cursorColor};
          background-size: 400%;
          background-position: var(--colorful-gradient-position);
          animation:
            4s rotate-colorful-gradient linear infinite,
            11s move-colorful-gradient linear infinite alternate;
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
      `}
    />
  )
})
