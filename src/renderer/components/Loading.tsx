import { Box, CircularProgress, Typography } from '@mui/material'

export default function Loading() {
  return (
    <Box
      height='100%'
      display='flex'
      flexDirection='column'
      justifyContent='center'
      alignItems='center'
    >
      <div>
        <CircularProgress size={80} thickness={2} />
      </div>
      <Box marginTop={6}>
        <Typography variant='h5' align='center' color='primary.light'>마비노기를 찾고 있습니다.</Typography>
        <Typography variant='h6' align='center' color='primary.light'>게임을 켜주세요.</Typography>
      </Box>
    </Box>
  )
}
