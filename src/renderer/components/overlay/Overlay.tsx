import { Box } from '@mui/material'
import CursorViewport from './CursorViewport.js'

export default function Overlay() {
  return (
    <Box
      width={'100%'}
      height={'100%'}
      position={'fixed'}
      top={0}
      left={0}
    >
      <CursorViewport />
    </Box>
  )
}
