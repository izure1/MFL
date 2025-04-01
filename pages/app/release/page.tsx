'use client'

import Showdown from '../../components/Showdown'
import CustomTypography from '../../components/CustomTypography'
import { GithubReleaseData, useGithubReleases } from '../hook'
import styles from './styles.module.scss'

interface ReleaseProps {
}

const Release: React.FC<ReleaseProps> = () => {
  const releaseNotes: GithubReleaseData[] = useGithubReleases(10)
  return (
    <div className='my-20'>
      <div className='h-[200px] mx-10'>
        <CustomTypography variant='h3'>지난 패치 노트</CustomTypography>
        <CustomTypography variant='body1'>
          최근 릴리스된 10개의 패치노트를 보여드립니다.
        </CustomTypography>
      </div>
      <div className='my-20 mx-20'>
        {
          releaseNotes.map((release, i) => (
            <div
              key={release.html_url}
              className={styles['release']}
            >
              <article>
                <div>
                  <CustomTypography variant='h4'>
                    <a href={release.html_url} target="_blank">Release {release.tag_name}</a>
                  </CustomTypography>
                  <CustomTypography variant='caption' className='text-darken'>
                    Released at {new Date(release.published_at).toLocaleString()}
                  </CustomTypography>
                </div>
                <hr className='border-none my-3' />
                <div>
                  <CustomTypography variant='body1'>
                    <Showdown markdown={release.body} />
                  </CustomTypography>
                </div>
              </article>
              {
                releaseNotes.length-1 > i && (
                  <div className='my-20 h-52'>
                    <div className='bg-white w-1 h-full ml-30' />
                  </div>
                )
              }
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Release
