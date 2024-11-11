import { Dialog, DialogProps } from '@mui/material'
import { parse as parseRGBA } from '../../../utils/RGBA.js'

interface GlassDialogProps extends DialogProps {
  glassBlur?: number
  glassRGBA?: string
}

export default function GlassDialog(props: GlassDialogProps) {
  const {
    glassRGBA = 'rgba(255, 255, 255, 0.1)',
    glassBlur = 10
  } = props

  const { r, g, b, a } = parseRGBA(glassRGBA)
  const borderAlpha = Math.min(1, a*1.8)
  const shadowAlpha = Math.min(1, a*3.7)
  
  return (
    <Dialog
      {...props}
      PaperProps={{
        sx: {
          background: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, ${a}), transparent) !important`,
          backdropFilter: `blur(${glassBlur}px) !important`,
          border: `1px solid rgba(${r}, ${g}, ${b}, ${borderAlpha}) !important`,
          boxShadow: `0 8px 32px 0 rgba(${r}, ${g}, ${b}, ${shadowAlpha}) !important`
        }
      }
    }>
      {props.children}
    </Dialog>
  )
}
