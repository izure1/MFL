import { useContext } from 'react'
import { Box } from '@mui/material'
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
    <Box
      className={className ?? ''}
      width={90}
      height={50}
      fontSize='smaller'
      borderRadius={1}
      display='flex'
      flexGrow={1}
      flexShrink={0}
      alignItems='center'
      justifyContent='center'
      bgcolor='rgba(0, 0, 0, 0.3)'
      border='1px solid transparent'
      boxSizing='border-box'
      onClick={onClick}
      onMouseDown={onMouseDown ?? (() => {})}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      sx={{
        cursor: 'pointer',
        transition: 'border 0.1s linear',
        '&:hover': {
          border: '1px solid orange'
        }
      }}
    >
      {context}
    </Box>
  )
}
