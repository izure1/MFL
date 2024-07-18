import { css } from '@emotion/react'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

export default function Loading() {
  return (
    <div css={css`
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    `}>
      <div>
        <CircularProgress size={80} thickness={2} />
      </div>
      <div css={css`
        margin-top: 50px;
      `}>
        <Typography variant='h5' align='center' color='primary.light'>마비노기를 찾고 있습니다.</Typography>
        <Typography variant='h6' align='center' color='primary.light'>게임을 켜주세요.</Typography>
      </div>
    </div>
  )
}
