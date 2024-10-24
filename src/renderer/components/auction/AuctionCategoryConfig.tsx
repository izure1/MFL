import { useContext, useState } from 'react'
import { Box, Button, Dialog, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import MabinogiCategory from '../../../config/auction/category.json'
import { AuctionWatchContext } from '../AuctionWatchProvider.js'
import { AuctionItemWatchScheme } from '../../../types/index.js'
import { createUUIDV4 } from '../../../utils/id.js'

const mabinogiCategories = Object
  .keys(MabinogiCategory)
  .flatMap((category) => {
    return MabinogiCategory[category as keyof typeof MabinogiCategory]
  })

export default function AuctionCategoryConfig({ pending }: {
  pending: boolean
}) {
  const [open, setOpen] = useState(false)
  const { category, setCategory, setWatchData } = useContext(AuctionWatchContext)

  function createNewAuctionWatch(category: string): AuctionItemWatchScheme {
    return {
      id: createUUIDV4(),
      itemCategory: category,
      itemOptions: []
    }
  }

  function handleChange(e: SelectChangeEvent) {
    const category = e.target.value
    setCategory(category)
    setWatchData(createNewAuctionWatch(category))
    setOpen(false)
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
      >
        <DialogTitle>검색 카테고리 설정</DialogTitle>
        <DialogContent>
          <Box pt={1}>
            <FormControl fullWidth>
              <InputLabel id='trade-search-category-mabinogi'>검색할 카테고리를 선택해주세요</InputLabel>
              <Select
                labelId="trade-search-category-mabinogi"
                value={category}
                label="카테고리"
                onChange={handleChange}
              >
                {
                  mabinogiCategories.map((category) => (
                    <MenuItem
                      key={`mabinogi-category-${category}`}
                      value={category}
                    >
                      <Typography>{category}</Typography>
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
      </Dialog>

      <Button
        variant='outlined'
        color={ category ? 'primary' : 'error' }
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        { category ? `카테고리: ${category}` : '카테고리 설정' }
      </Button>
    </>
  )
}