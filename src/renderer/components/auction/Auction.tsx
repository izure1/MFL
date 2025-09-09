import { useContext, useEffect, useMemo, useState } from 'react'
import { Alert, AlertTitle, Box, Button, Typography } from '@mui/material'
import MabinogiAPIConfig from './APIConfig.js'
import MabinogiCategoryConfig from './AuctionCategoryConfig.js'
import MabinogiAuctionList from './AuctionList.js'
import { AuctionWatchContext } from '../AuctionWatchProvider.js'
import MabinogiAuctionWatchSubscribe from './AuctionWatchSubscribe.js'
import { ipc } from '../../ipc.js'
import { AuctionResponse } from '../../../types/index.js'
import { ConfigContext } from '../ConfigProvider.js'

export default function Auction() {
  const { apiKey } = useContext(ConfigContext)
  const {
    category,
    watchData,
    setWatchEditorOpen
  } = useContext(AuctionWatchContext)
  const [pending, setPending] = useState(false)
  const [searchResult, setSearchResult] = useState<AuctionResponse|null>(null)

  const searchResultItems = useMemo(() => {
    if (!searchResult || !searchResult.auction_item) {
      return []
    }
    return searchResult.auction_item
  }, [searchResult, watchData])

  const searchResultError = useMemo(() => {
    if (searchResult && searchResult.error) {
      return searchResult.error
    }
    return null
  }, [searchResult])

  const searchable = useMemo(() => !!(apiKey && category), [
    apiKey,
    category
  ])

  async function search() {
    if (!searchable) {
      return
    }
    setPending(true)
    const res = await ipc.auction.fetch(watchData, 'auction_price_per_unit')
    setPending(false)
    setSearchResult(res)
  }

  useEffect(() => {
    search()
  }, [searchable, category, JSON.stringify(watchData)])

  return (
    <>
      <Box
        display='flex'
        flexDirection='row'
        columnGap={1}
      >
        <MabinogiAPIConfig
          apiKey={apiKey}
        />
        <MabinogiCategoryConfig pending={pending} />
        { (searchResult && !searchResultError) && (
            <Button
              variant='outlined'
              color='warning'
              onClick={() => setWatchEditorOpen(true)}
            >
              상세 검색
            </Button>
          )
        }
        <MabinogiAuctionWatchSubscribe />
      </Box>
      {
        searchResultError && (
          <Alert
            variant='filled'
            severity='error'
            sx={{ my: 1 }}
          >
            <AlertTitle>{searchResultError.name}</AlertTitle>
            <Typography>{searchResultError.message}</Typography>
          </Alert>
        )
      }
      <MabinogiAuctionList
        pending={pending}
        list={searchResultItems}
      />
    </>
  )
}
