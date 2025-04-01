import { Typography, type TypographyProps } from '@mui/material'

interface CustomTypography extends TypographyProps {
}

const CustomTypography: React.FC<CustomTypography> = ({ children, ...props }) => {
  return (
    <Typography
      sx={{
        wordSpacing: '0.15em'
      }}
      {...props}
    >
      {children}
    </Typography>
  )
}

export default CustomTypography
