import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import CustomTheme from './CustomTheme'
import Footer from './Footer'
import './globals.css'

interface RootLayoutProps {
  children: React.ReactNode
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '마탕화면 도우미 - MFL',
  description: '좀 더 편한 마비노기 생활을 위한 마탕화면 도우미 애플리케이션',
  icons: '/img/icon.ico',
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang='ko'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CustomTheme>
          {children}
          <hr className='mt-40 border-none h-[1px] bg-[rgb(35,_39,_41)]' />
          <Footer />
        </CustomTheme>
      </body>
    </html>
  )
}

export default RootLayout
