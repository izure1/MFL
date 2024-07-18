import { useContext } from 'react'
import { context as detectorContext } from './DetectorProvider'
import Container from '@mui/material/Container'
import Loading from './Loading'
import Config from './Config'
import { css } from '@emotion/react'

import bgImage from '../assets/img/bg.webp'

export default function Main() {
  const process = useContext(detectorContext)

  return (
    <Container sx={{ height: '100%' }}>
      <div css={css`
        width: 100%;
        height: 100%;
        position: fixed;
        top: 48px;
        left: 0;
        z-index: -1;
        background: url(${bgImage}) no-repeat center;
        background-size: cover;
      `}>
        <div css={css`
          width: 100%;
          height: 100%;
          backdrop-filter: blur(5px);
        `}></div>
      </div>
      { process ? <Config /> : <Loading /> }
    </Container>
  )
}
