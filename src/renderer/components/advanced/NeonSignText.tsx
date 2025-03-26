import { Typography, TypographyProps } from '@mui/material'
import ColorfulText from './ColorfulText.js'

interface NeonSignText extends TypographyProps {
  disabled?: boolean
}

export default function NeonSignText(props: NeonSignText) {
  return (
    !!props.disabled ? (
      <Typography { ...props }>{props.children}</Typography>
    ) : (
      <Typography { ...props } sx={{
        textShadow: 'none'
      }}>
        <ColorfulText>{props.children}</ColorfulText>
      </Typography>
    )
  )
}
