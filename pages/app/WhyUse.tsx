import Contributor from '../../contributor.json' with { type: 'json' }
import React, { CSSProperties } from 'react'
import OnView from '../components/OnView'
import CustomTypography from '../components/CustomTypography'
import styles from './style.module.scss'

const WhyUseReason: React.FC<{
  title: string
  overline: string
  description: React.ReactNode[][],
}> = ({ title, overline, description }) => {
  return (
    <OnView
      onOutClass={[
        styles['on-view'],
        '',
      ]}
      viewOption={{
        threshold: 0.15
      }}
    >
      <div
        className={`mb-48 ${styles['reason-show']}`}
      >
        <CustomTypography variant='h4' className={styles['text-gradient']}>{title}</CustomTypography>
        <CustomTypography variant='overline' sx={{
          letterSpacing: '0.1rem',
          wordSpacing: '0.3rem',
          marginLeft: '0.2rem',
        }}>{overline}</CustomTypography>
        {
          description.map((sentences, i) => (
            <CustomTypography
              key={i}
              variant='body1'
              component={'div'}
              mt={2}
            >
              {
                sentences.map((sentence, j) => (
                  <span key={j}>
                    {sentence}
                    {sentences.length-1 > j && <br />}
                  </span>
                ))
              }
            </CustomTypography>
          ))
        }
      </div>
    </OnView>
  )
}

interface WhyUseProps extends React.ComponentPropsWithoutRef<'div'> {
}

const WhyUse: React.FC<WhyUseProps> = ({ children }) => {
  return (
    <div className='flex justify-center'>
      <div className='w-full px-5 lg:px-0 lg:max-w-3xl'>
        <WhyUseReason
          title={'백그라운드 성능 제한'}
          overline={'컴퓨터도 휴식이 필요합니다'}
          description={[
            [
              `다른 작업을 하면서 마비노기를 바탕화면처럼 쓰시는 분들이 많습니다.`,
              '하지만 마비노기는 오래된 게임이고, CPU를 많이 점유합니다. 성능을 제한할 도구가 필요합니다.',
            ],
            [
              '마비노기 활성화 상태를 감지하고, 사용 중이 아닐 때 CPU를 제한하여 컴퓨터 성능을 원활하게 만듭니다.'
            ],
            [
              <div>
                <div className='grid grid-rows-1 grid-cols-1 lg:grid-cols-2 gap-4'>
                  <div className='shrink rounded-xs overflow-hidden'>
                    <img
                      src='/img/chart-limit-before.svg'
                      alt='마탕화면 도우미 사용 전 차트'
                    />
                    <img
                      src='/img/perf-limit-before.webp'
                      alt='마탕화면 도우미 사용 전 차트'
                    />
                  </div>
                  <div className='shrink rounded-xs overflow-hidden'>
                    <img
                      src='/img/chart-limit-after.svg'
                      alt='마탕화면 도우미 사용 후 차트'
                    />
                    <img
                      src='/img/perf-limit-after.webp'
                      alt='마탕화면 도우미 사용 후 차트'
                    />
                  </div>
                </div>
                <div className='text-center mt-5'>
                  <CustomTypography variant='caption' className='text-darken'>
                    사용 전, 사용 후. 최대치가 60,000에서 1,000이 되었다는 점에 주목하세요.
                    <br />
                    최대 +95%까지 성능이 향상됩니다.
                  </CustomTypography>
                </div>
              </div>
            ]
          ]}
        />

        <WhyUseReason
          title={'간편 매크로'}
          overline={'좀 더 편한 전투 시스템을 위해'}
          description={[
            [
              '마비노기에서 사냥 시, 일부 키조합이 필요한 매크로는 회색지대에 놓여져 있습니다.',
              '그러나 특정 게이밍 마우스/키보드 이용자들만 사용할 수 있죠.',
            ],
            [
              <div className='flex justify-center my-12'>
                <div className='w-[550px] rounded-xs overflow-hidden'>
                  <img
                    src='/img/preview-macro-editor.webp'
                    alt='마탕화면 도우미 매크로 미리보기'
                    loading='lazy'
                  />
                </div>
              </div>
            ],
            [
              '본 기능은 이러한 불이익을 최소화하기 위해 만들어졌으며,',
              '때문에 동등/비슷한 수준의 기능만을 지원합니다. 따라서 그 이상은 지원하지 않습니다.',
            ],
            [
              <CustomTypography>
                마비노기 공식 홈페이지의&nbsp;
                <a
                  href='https://mabinogi.nexon.com/page/archive/guide_view.asp?id=4889849&num=8'
                  target='_blank'
                  className='text-highlight'
                >
                  권장하지 않는 플레이 방식 안내
                </a>
                를 준수해주세요.
                <br />
                개발자는 매크로 사용을 권장하지 않으며, 불이익으로 인한 책임은 본인의 몫입니다.
              </CustomTypography>,
            ],
          ]}
        />

        <WhyUseReason
          title={'블랙박스 스냅샷'}
          overline={'증거가 없으면, 주장은 단지 의견에 불과합니다'}
          description={[
            [
              <div className='max-w-[85%] h-[40rem] flex justify-center items-center translate-y-[-15rem] pointer-events-none'>
                <div className={styles['reason-snapshot']}>
                  {
                    [1, 2, 3].map((i) => (
                      <img
                        key={`preview-image-${i}`}
                        src={`/img/preview-snapshot-${i}.webp`}
                        alt={`마탕화면 도우미 스냅샷 ${i}`}
                        className={styles['reason-snapshot-image']}
                        loading='lazy'
                        style={{
                          '--index': i
                        } as CSSProperties}
                      />
                    ))
                  }
                </div>
              </div>
            ],
            [
              '게임 플레이 도중, 일정 간격으로 스크린샷을 찍어 보관합니다.',
              '분쟁 시 증거 자료로 활용할 수 있습니다. 블랙박스처럼 활용하세요.',
            ],
            [
              '스크린샷 용량은 최대한 압축되어 저장됩니다.',
              <CustomTypography variant='caption' className='text-darken'>(평균 1시간 당 30MB)</CustomTypography>,
            ]
          ]}
        />

        <WhyUseReason
          title={'경매장 검색 및 알리미'}
          overline={'원하는 매물의 실시간 알림을 받아보세요'}
          description={[
            [
              <div className='grid grid-rows-1 grid-cols-1 lg:grid-cols-2 gap-2 my-12'>
                <div className='rounded-xs overflow-hidden flex justify-center'>
                  <video
                    width={'100%'}
                    src='/img/preview-auction-search.mp4'
                    className='h-auto rounded-xs overflow-hidden'
                    preload={'auto'}
                    muted={true}
                    autoPlay={true}
                    controls={false}
                    loop={true}
                  />
                </div>
                <div className='rounded-xs overflow-hidden flex justify-center'>
                  <img
                    src='/img/preview-auction-subscribe.webp'
                    alt='마탕화면 도우미 경매장 구독'
                  />
                </div>
              </div>
            ],
            [
              '매번 직접 찾아보고 있나요?'
            ],
            [
              '구독 기능으로 실시간 매물 알림을 받아보세요.',
              '원하는 매물이 등록되면, 즉시 윈도우로 알림을 받을 수 있습니다.',
            ],
            [
              '인게임보다 정교한 검색으로 원하는 매물을 놓치지 마세요.'
            ]
          ]}
        />

        <WhyUseReason
          title={'인게임 오버레이'}
          overline={'게임 내에서 부가적인 기능을 제공합니다'}
          description={[
            [
              <div className='flex justify-center my-12'>
                <video
                  src='/img/preview-overlay.mp4'
                  className='h-auto rounded-xs overflow-hidden'
                  preload={'auto'}
                  muted={true}
                  autoPlay={true}
                  controls={false}
                  loop={true}
                />
              </div>
            ],
            [
              '마비노기에 부족한 기능들을 보완해줍니다.',
              '마우스 커서 강조 기능, 현재 시간 표시 등 다양한 지원을 받아보세요.',
            ],
          ]}
        />

        <WhyUseReason
          title={'오픈소스 기여'}
          overline={'향후 업데이트를 지원하세요'}
          description={[
            [
              '프로젝트에 기여하여 업데이트를 지원해주세요.',
              '아래는 이 프로젝트의 기여자입니다. 모두 감사합니다!',
            ],
            [
              <div>
                <hr className='border-none h-[1px] bg-darken my-15' />
                <div>
                  {
                    Object.keys(Contributor).map((field) => (
                      <div key={field} className='mb-10'>
                        <CustomTypography variant='h5' className='text-highlight'>{field.toUpperCase()}</CustomTypography>
                        <CustomTypography variant='body2' className='px-3'>
                          {
                            Contributor[field as keyof typeof Contributor].join(', ') || '-'
                          }
                        </CustomTypography>
                      </div>
                    ))
                  }
                </div>
                <hr className='border-none h-[1px] bg-darken my-15' />
              </div>
            ],
            [
              '마비노기의 불편함을 개선하기 위해 계속 업데이트됩니다.',
              '오류를 찾았거나, 건의사항이 있다면 아래 링크를 참조해주세요.'
            ],
            [
              <CustomTypography
                variant='subtitle1'
                letterSpacing={'0.1rem'}
                className={`${styles['text-gradient']}`}
              >
                <a
                  href={'https://github.com/izure1/MFL/issues'}
                  target={'_blank'}
                >
                  https://github.com/izure1/MFL/issues
                </a>
              </CustomTypography>
            ],
          ]}
        />
      </div>
    </div>
  )
}

export default WhyUse
