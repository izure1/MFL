import Header from './Header'
import React from 'react'
import WhyUse from './WhyUse'

interface HomeProps extends React.ComponentPropsWithoutRef<'div'> {
}

const Home: React.FC<HomeProps> = () => {
  return (
    <>
      <Header />
      <hr className='my-40 mx-20 border-none bg-darken' />
      <WhyUse />
    </>
  )
}

export default Home
