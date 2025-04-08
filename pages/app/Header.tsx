import CustomTypography from '../components/CustomTypography'
import HeaderDownload from './HeaderDownload'
import styles from './style.module.scss'

interface HeaderProps extends React.ComponentPropsWithoutRef<'div'> {
}

const Header: React.FC<HeaderProps> = async () => {
  return (
    <div className='min-h-[500px] h-dvh max-h-[1080px] w-full flex justify-center items-center'>
      <div className='max-w-full lg:max-w-5xl px-5 lg:px-0'>
        <div className='grid grid-rows-1 grid-cols-1 lg:grid-cols-[repeat(2,_minmax(0,_auto))] gap-10'>
          <div className='lg:max-w-[350px]'>
            <div className={styles['header-title']}>
              <CustomTypography
                variant={'h1'}
                maxHeight={'5rem'}
                className={styles['text-gradient']}
              >
                MFL
              </CustomTypography>
              <CustomTypography
                variant={'overline'}
                letterSpacing={'0.1rem'}
              >
                Mabinogi foreground limiter
              </CustomTypography>
            </div>
            <div className={`mt-8 ${styles['header-description']}`}>
              <CustomTypography variant={'h5'}>
                <span className='text-4xl text-highlight'>편한</span> 마비노기 생활을 위한
              </CustomTypography>
              <CustomTypography variant={'h4'} className='text-highlight'>마탕화면 도우미</CustomTypography>
            </div>
            <div className={`mt-5 ${styles['header-download']}`}>
              <div>
                <CustomTypography variant={'body1'}>
                  MFL은 무료, 오픈소스, 프로젝트로 
                  게임 마비노기에 편의성을 추가해주는 애플리케이션입니다. 
                  게임을 위변조하지 않으며, 안전합니다.
                </CustomTypography>
              </div>
              <HeaderDownload className='mt-8' />
            </div>
          </div>

          <div className={`w-auto h-full ${styles['preview-app-main']}`}>
            <video
              width={'100%'}
              src='/img/preview-app-main.mp4'
              className='h-auto rounded-xs overflow-hidden'
              preload={'auto'}
              muted={true}
              autoPlay={true}
              controls={false}
              loop={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
