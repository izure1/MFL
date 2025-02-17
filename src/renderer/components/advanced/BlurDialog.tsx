import { Dialog, type DialogProps } from '@mui/material'

interface GlassDialogProps extends DialogProps {
  blur?: number
}

export default function BlurDialog(props: GlassDialogProps) {
  const {
    blur = 5
  } = props
  
  return (
    <Dialog
      { ...props }
      sx={{
        backdropFilter: `blur(${blur}px)`,
        '& .MuiDialogTitle-root': {
          color: 'rgb(225, 173, 145)'
        }
      }}
      PaperProps={{
        sx: {
          backgroundImage: 'none',
          background: `linear-gradient(0deg, rgb(24, 24, 26), rgb(13, 13, 14)) !important`,
        }
      }}
    >
      {props.children}
    </Dialog>
  )
}
