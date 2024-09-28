import { useContext } from 'react'
import { css } from '@emotion/react'
import { HoveringContext } from './MacroEditor.js'

export default function MacroUnitRawButton({
  context,
  className,
  onClick,
  onMouseDown,
}: {
  context: React.ReactNode
  className?: string
  onClick: () => void
  onMouseDown?: (e: React.MouseEvent) => void
}) {
  const [_hovering, setHovering]= useContext(HoveringContext)
  return (
    <div
      className={className ?? ''}
      css={css`
        width: 90px;
        height: 50px;
        font-size: smaller;
        border-radius: 5px;
        display: flex;
        flex: 1 0;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.3);
        cursor: pointer;
        border: 1px solid transparent;
        box-sizing: border-box;
        transition: border 0.1s linear;
        &:hover {
          border: 1px solid orange;
        }
      `}
      onClick={onClick}
      onMouseDown={onMouseDown ?? (() => {})}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >{context}</div>
  )
}
