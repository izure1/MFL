import { useContext } from 'react'
import { context as detectorContext } from './DetectorProvider.js'
import { Box, Container } from '@mui/material'
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
      <Box
        width='100%'
        height='100%'
        position='absolute'
        top={0}
        left={0}
        zIndex={-1}
        sx={{
          background: `rgba(0, 0, 0, 0.3) url(${bgImage}) no-repeat center`,
          backgroundBlendMode: 'multiply',
          backgroundSize: 'cover',
          backdropFilter: 'blur(0)',
        }}
      >
        <Box
          width='100%'
          height='100%'
          sx={{
            backdropFilter: 'blur(5px)'
          }}
        />
      </Box>
      { process ? <Config /> : <Loading /> }
    </Container>
  )
}
