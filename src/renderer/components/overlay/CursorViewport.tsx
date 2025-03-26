import { useContext, useMemo, useRef, useState } from 'react'
import { css } from '@emotion/react'
import { ConfigContext } from '../ConfigProvider.js'
import Cursor from '../Cursor.js'
import CursorCrosshair from '../CursorCrosshair.js'

export default function CursorViewport() {
  const config = useContext(ConfigContext)
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { screenX, screenY } = e
    setX(screenX)
    setY(screenY)
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
      { config && config.cursorRunning && config.cursorCrosshair && (
        <CursorCrosshair
          cursorColor={config.cursorColor}
          cursorSize={config.cursorSize}
          x={x}
          y={y}
        />
      ) }
      { config && config.cursorRunning && (
        <Cursor
          cursorColor={config.cursorColor}
          cursorSize={config.cursorSize}
          cursorThickness={config.cursorThickness}
          x={x}
          y={y}
        />
      ) }
    </div>
  )
}
