import { useContext, useEffect, useMemo, useRef } from 'react'
import { css } from '@emotion/react'
import { ConfigContext } from '../ConfigProvider.js'
import Cursor from '../Cursor.js'

export default function CursorViewport() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const config = useContext(ConfigContext)

  const halfSize = useMemo(() => {
    if (!config) {
      return 0
    }
    return config.cursorSize / 2
  }, [config])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { screenX, screenY } = e
    const x = screenX - halfSize
    const y = screenY - halfSize
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${x}px, ${y}px)`
    }
  }

  return (
    <div
      css={css`
        width: 100%;
        height: 100%;
        position: fixed;
        top: 0;
        left: 0;
      `}
      onMouseMove={handleMouseMove}
    >
      { config && config.cursorRunning && (
        <Cursor
          ref={cursorRef}
          cursorColor={config.cursorColor}
          cursorSize={config.cursorSize}
          cursorThickness={config.cursorThickness}
        />
      ) }
    </div>
  )
}
