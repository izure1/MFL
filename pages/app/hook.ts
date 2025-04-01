'use client'

import RepositoryConfig from '../config/repository.json' with { type: 'json' }
import { useEffect, useState } from 'react'

export interface GithubReleaseAssetData {
  browser_download_url: string
  download_count: number
  name: string
  size: number
}

export interface GithubReleaseRawData {
  html_url: string
  tag_name: string
  published_at: string
  body: string
  assets: GithubReleaseAssetData[]
}

export interface GithubReleaseData {
  html_url: string
  tag_name: string
  published_at: string
  body: string
  browser_download_url: string
}

function getInstallerAssetUrl(assets: GithubReleaseAssetData[]): string {
  let guessAsset = assets.find((asset) => asset.name.toLowerCase().endsWith('.exe'))
  if (guessAsset) {
    return guessAsset.browser_download_url
  }
  return ''
}

async function fetchData(length: number): Promise<GithubReleaseData[]> {
  const res   = await fetch(`https://api.github.com/repos/${RepositoryConfig.github_repository}/releases`)
  const data  = await res.json() as GithubReleaseRawData[]
  const some  = data.slice(0, length)
  return some.map((t) => ({
    html_url: t.html_url,
    tag_name: t.tag_name,
    published_at: t.published_at,
    body: t.body,
    browser_download_url: getInstallerAssetUrl(t.assets),
  }))
}

export function useGithubReleases(length: number): GithubReleaseData[] {
  const [releases, setReleases] = useState<GithubReleaseData[]>([])

  useEffect(() => {
    fetchData(length).then(setReleases)
  }, [length])

  return releases
}
