'use client'

import { createTheme, ThemeProvider } from '@mui/material'
import React from 'react'

export const theme = createTheme({
  typography: {
    fontFamily: 'Mabinogi'
  },
  palette: {
    text: {
      primary: 'rgb(230, 230, 230)'
    }
  },
})

interface CustomThemeProps extends React.ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode
}

const CustomTheme: React.FC<CustomThemeProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  )
}

export default CustomTheme
