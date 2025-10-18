'use client'

import { Button, Tooltip } from '@mui/material'
import { DownloadOutlined } from '@mui/icons-material'
import CustomTypography from '../components/CustomTypography'
import { GithubReleaseData, useGithubReleases } from './hook'

interface HeaderDownloadProps extends React.ComponentProps<'div'> {
}

function useLatestGithubRelease(): GithubReleaseData {
  const releases = useGithubReleases(1)
  const release = releases.at(0)
  if (!release) {
    return {
      body: '',
      browser_download_url: '/',
      html_url: '/',
      published_at: '0',
      tag_name: '',
    }
  }
  return release
}

const HeaderDownload: React.FC<HeaderDownloadProps> = (props) => {
  const { browser_download_url, tag_name, published_at } = useLatestGithubRelease()
  return (
    <div { ...props }>
      <Tooltip title='현재 비인가 등록 이슈로 다운로드할 수 없습니다. 자세한 내용은 깃허브 저장소를 참고해주세요.'>
        <Button
          href={browser_download_url}
          target='_blank'
          variant='contained'
          fullWidth
          endIcon={<DownloadOutlined />}
          className='!bg-highlight'
          sx={{
            py: 1.5
          }}
          disabled={true}
        >
          {tag_name} 다운로드
        </Button>
      </Tooltip>
      <div className='text-center'>
        <CustomTypography
          variant='caption'
          className='text-darken'
        >
          Released at {new Date(published_at).toLocaleString()}
        </CustomTypography>
      </div>
    </div>
  )
}

export default HeaderDownload
