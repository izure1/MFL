import { useContext } from 'react'
import { css } from '@emotion/react'
import { context as detectorContext } from './DetectorProvider.js'
import { Container } from '@mui/material'
import Loading from './Loading.js'
import Config from './Config.js'

import bgImage from '../assets/img/bg.webp'

export default function Main() {
  const process = useContext(detectorContext)

  return (
    <Container sx={{
      height: '100%',
      position: 'relative'
    }}>
      <div css={css`
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
        background: url(${bgImage}) no-repeat center;
        background-size: cover;
        backdrop-filter: blur(0);
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
