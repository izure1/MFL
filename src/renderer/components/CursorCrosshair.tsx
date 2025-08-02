import { css } from '@emotion/react'
import { forwardRef, useMemo } from 'react'

interface CursorCrosshairComponentProps {
  cursorSize: number
  cursorColor: string
  x: number
  y: number
}

const linearGradientRegexp = /^linear\-gradient\((.*)\)$/g

export default forwardRef<HTMLDivElement, CursorCrosshairComponentProps>(({
  cursorColor,
  cursorSize,
  x,
  y,
}, ref) => {
  const color = useMemo(() => {
    return linearGradientRegexp.test(cursorColor) ? 'white' : cursorColor
  }, [cursorColor])
  const paddingSize = cursorSize * 1.3
  const marginSize = cursorSize / 1.3
  return (
    <div
      ref={ref}
      style={{
        '--cursor-x': `${x}px`,
        '--cursor-y': `${y}px`,
        '--cursor-color': color,
        '--cursor-size': `${cursorSize}px`,
        '--padding-size': `${paddingSize}px`,
        '--margin-size': `${marginSize}px`,
      } as React.CSSProperties}
      css={css`
        width: 100%;
        height: 100%;
        position: absolute;
        background: transparent;
        top: 0;
        left: 0;
        pointer-events: none;
        transform: translate(var(--cursor-x), var(--cursor-y));
      `}
    >
      {/* vertical line */}
      <div
        css={css`
          width: 1px;
          height: 200%;
          background: linear-gradient(
            0deg,
            var(--cursor-color) 0% calc(50% - max(50px, var(--padding-size))),
            transparent calc(50% - max(25px, var(--margin-size))) 50%,
            transparent 50% calc(50% + max(25px, var(--margin-size))),
            var(--cursor-color) calc(50% + max(50px, var(--padding-size))) 100%
          );
          position: absolute;
          top: -100%;
          left: 0;
        `}
      />
      {/* horizon line */}
      <div
        css={css`
          width: 200%;
          height: 1px;
          background: linear-gradient(
            90deg,
            var(--cursor-color) 0% calc(50% - max(50px, var(--padding-size))),
            transparent calc(50% - max(25px, var(--margin-size))) 50%,
            transparent 50% calc(50% + max(25px, var(--margin-size))),
            var(--cursor-color) calc(50% + max(50px, var(--padding-size))) 100%
          );
          position: absolute;
          top: 0;
          left: -100%;
        `}
      />
    </div>
  )
})
