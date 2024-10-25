import { Badge, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material'
import { useContext, useEffect, useMemo, useState } from 'react'
import { DeleteForeverRounded } from '@mui/icons-material'
import { AuctionWatchContext } from '../AuctionWatchProvider.js'
import { AuctionItemWatchScheme } from '../../../types/index.js'
import { ipc } from '../../ipc.js'
import { createUUIDV4 } from '../../../utils/id.js'
import { optionResolvers, getFilteredAuctionItems } from '../../../helpers/auction.js'

export default function AuctionWatchSubscribe() {
  const [open, setOpen] = useState(false)
  const [watches, setWatches] = useState<AuctionItemWatchScheme[]>([])
  const {
    watchData,
    setWatchData,
    setWatchEditorOpen,
    nonInspectedItems,
    requestFetchNonInspectItems
  } = useContext(AuctionWatchContext)

  const badgeInvisible = useMemo(() => !nonInspectedItems.length, [
    nonInspectedItems
  ])

  async function handleUpdate() {
    if (!watchData?.itemCategory) {
      return
    }
    await ipc.auction.watchSet(cloneWatchData())
    await fetchWatches()
    await requestFetchNonInspectItems()
    await ipc.auction.requestFetchWanted()
  }

  function getNonInspectedItemsFromWatchData(watchData: AuctionItemWatchScheme) {
    const targetItems = nonInspectedItems.filter((item) => item.watch_id === watchData.id)
    return getFilteredAuctionItems(targetItems, watchData)
  }

  function cloneWatchData() {
    const clone = structuredClone(watchData)
    clone.id = createUUIDV4()
    return clone
  }

  async function handleRemove(watchData: AuctionItemWatchScheme) {
    await ipc.auction.watchRemove(watchData)
    await fetchWatches()
  }

  function handleShowDetail(watchData: AuctionItemWatchScheme) {
    setWatchData(watchData)
    setWatchEditorOpen(true)
  }

  async function inspect(watchData: AuctionItemWatchScheme) {
    await ipc.auction.inspect(watchData)
  }

  async function fetchWatches() {
    const watches = await ipc.auction.watchGetFromCategory()
    setWatches(watches)
  }

  function existsOption(itemOption: AuctionItemWatchScheme['itemOptions'][0]) {
    return optionResolvers.has(itemOption.resolver_id)
  }

  function createOptionReadable(itemOption: AuctionItemWatchScheme['itemOptions'][0]) {
    const guess = optionResolvers.get(itemOption.resolver_id)
    return `${guess.name}: ${JSON.stringify(itemOption.value)}`
  }

  useEffect(() => {
    fetchWatches()
  }, [])

  return (
    <>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
      >
        <DialogTitle>구독 관리</DialogTitle>
        <DialogContent>
          <DialogContentText>
            현재 검색 옵션을 즐겨찾기하세요.
            <br />
            그러면 일치하는 매물을 찾았을 때 소리와 함께 알림을 보내드릴게요.
          </DialogContentText>
          <List dense>
            {
              watches.map((watchData) => (
                <ListItemButton
                  key={watchData.id}
                  onClick={() => {
                    handleShowDetail(watchData)
                    inspect(watchData)
                  }}
                >
                  <ListItem dense secondaryAction={(
                      <IconButton onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(watchData)
                      }}>
                        <DeleteForeverRounded />
                      </IconButton>
                    )}
                  >
                    <ListItemText secondary={(
                      <Typography fontSize='small' color='gray'>
                        {
                          watchData
                            .itemOptions
                            .filter(existsOption)
                            .map(createOptionReadable)
                            .join(', ')
                        }
                      </Typography>
                    )}>
                      <Badge
                        color='warning'
                        badgeContent={getNonInspectedItemsFromWatchData(watchData).length}
                        max={999}
                        sx={{
                          '& .MuiBadge-badge': {
                            width: 'fit-content',
                            position: 'relative',
                            left: 0,
                            top: 8,
                          }
                        }}
                      >
                        <Box display='inline-block'>{watchData.itemCategory}</Box>
                      </Badge>
                    </ListItemText>
                  </ListItem>
                </ListItemButton>
              ))
            }
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            variant='outlined'
            disabled={!watchData}
            fullWidth
            size='large'
            onClick={handleUpdate}
          >
            { watchData ? '현재 검색 설정 구독' : '먼저 카테고리를 선택하세요' }
          </Button>
        </DialogActions>
      </Dialog>
      <Badge
        variant='dot'
        color='warning'
        invisible={badgeInvisible}
      >
        <Button
          variant='outlined'
          onClick={() => setOpen(true)}
        >구독 관리</Button>
      </Badge>
    </>
  )
}
