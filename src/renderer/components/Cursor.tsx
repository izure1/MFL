import { css } from '@emotion/react'
import { forwardRef } from 'react'

interface CursorComponentProps {
  cursorThickness: number
  cursorSize: number
  cursorColor: string
  x: number
  y: number
}

export default forwardRef<HTMLDivElement, CursorComponentProps>(({
  cursorColor,
  cursorSize,
  cursorThickness,
  x,
  y,
}, ref) => {
  const halfSize = cursorSize / 2
  x -= halfSize
  y -= halfSize
  return (
    <div
      ref={ref}
      style={{
        '--cursor-color': cursorColor,
        '--cursor-size': `${cursorSize}px`,
        '--cursor-thickness': `${cursorThickness}px`,
        '--cursor-x': `${x}px`,
        '--cursor-y': `${y}px`,
      } as React.CSSProperties}
      css={css`
        width: var(--cursor-size);
        height: var(--cursor-size);
        position: absolute;
        box-sizing: border-box;
        border-radius: calc(1px / 0);
        background: transparent;
        top: 0;
        left: 0;
        pointer-events: none;
        transform: translate(var(--cursor-x), var(--cursor-y));

        &::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: var(--cursor-thickness); /* 테두리 두께 */
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
