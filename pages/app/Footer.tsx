import CustomTypography from '@/components/CustomTypography'
import { GitHub } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import Link from 'next/link'

interface Sitemap {
  text: string
  url: string
}

interface FooterProps extends React.ComponentPropsWithoutRef<'div'> {
}

const Footer: React.FC<FooterProps> = async () => {
  const sitemap: Sitemap[] = [
    {
      text: '오류 제보',
      url: 'https://github.com/izure1/mfl/issues'
    },
    {
      text: '패치 노트',
      url: '/release'
    },
  ]
  return (
    <div className='py-6 px-18'>
      <div className='grid grid-rows-1 grid-cols-[auto_1fr_auto]'>
        {/* sitemap */}
        <div className='flex flex-row gap-x-18'>
          {
            sitemap.map((item, i) => (
              <div key={i} className='flex justify-center items-center'>
                <Link href={item.url}>
                  <CustomTypography>{item.text}</CustomTypography>
                </Link>
              </div>
            ))
          }
        </div>
        {/* spacer */}
        <div></div>
        {/* navigator */}
        <div>
          <IconButton
            href='https://github.com/izure1/mfl'
            target='_blank'
          >
            <GitHub sx={{
              color: 'rgb(230, 230, 230)'
            }} />
          </IconButton>
        </div>
      </div>
    </div>
  )
}

export default Footer
