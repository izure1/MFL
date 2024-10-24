import styled from '@emotion/styled'
import { Fragment, useState } from 'react'
import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, FormControl, Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { humanizeNumber } from '../../../utils/format.js'
import { AuctionItemScheme } from '../../../types/index.js'

const DefinitionList = styled.dl`
  & dt {
    font-size: large;
    font-family: Mabinogi;
    color: rgb(185, 160, 130);
    margin: 0;
    display: inline-block;
  }
  & dd {
    font-family: Mabinogi;
    margin: 0;
  }
`

function getRemainingTime(startTimestamp: number, endTimestamp: number): string {
  const remainingTime = endTimestamp - startTimestamp
  const hours = Math.floor(remainingTime / 1000 / 60 / 60)
  const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60))
  const rtf = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' })

  if (hours > 0) {
    return rtf.format(hours, 'hours')
  } else if (minutes > 0) {
    return rtf.format(minutes, 'minutes')
  } else {
    return rtf.format(0, 'minutes')
  }
}

function createItemOptionDescription(item: AuctionItemScheme) {
  const map: Record<string, Record<string, {
    value1: string
    value2: string
    description: string
  }>> = {}
  if (item.item_option === null) {
    map['아이템'] = {
      '정보': {
        value1: '아이템 정보가 없습니다',
        value2: null,
        description: null,
      }
    }
    return map
  }
  for (const option of item.item_option) {
    let {
      option_type,
      option_sub_type,
      option_value,
      option_value2,
      option_desc
    } = option
    if (!Object.hasOwn(map, option.option_type)) {
      map[option_type] = {}
    }
    if (option_sub_type === null) {
      option_sub_type = ''
    }
    map[option_type][option_sub_type] = {
      value1: option_value,
      value2: option_value2,
      description: option_desc,
    }
  }
  return map
}

const Columns: GridColDef<AuctionItemScheme>[] = [
  {
    field: 'item_display_name',
    width: 400,
    headerName: '아이템 이름'
  },
  {
    field: 'auction_price_per_unit',
    width: 230,
    headerName: '개당 가격',
    valueFormatter: (value: number) => `${humanizeNumber(value)} Gold`
  },
  {
    field: 'item_count',
    width: 130,
    headerName: '아이템 개수',
    valueFormatter: (value: number) => new Intl.NumberFormat().format(value)
  },
  {
    field: 'date_auction_expire',
    width: 140,
    headerName: '만료 시간',
    valueFormatter: (value: string) => getRemainingTime(Date.now(), new Date(value).getTime())
  },
]

export default function AuctionList({
  pending,
  list
}: {
  pending: boolean
  list: AuctionItemScheme[]
}) {
  const [preview, setPreview] = useState<AuctionItemScheme|null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  function select(item: AuctionItemScheme) {
    setPreview(item)
    setPreviewOpen(true)
  }

  function handlePreviewClose() {
    setPreview(null)
    setPreviewOpen(false)
  }

  return (
    <>
      {
        preview && (
          <Dialog
            open={previewOpen}
            onClose={handlePreviewClose}
            fullWidth
          >
            <DialogTitle>{preview.item_display_name}</DialogTitle>
            <DialogContent>
              <DefinitionList>
                {
                  Object.keys(createItemOptionDescription(preview)).map((key, i) => {
                    const description = createItemOptionDescription(preview)
                    const group = description[key]
                    return (
                      <Box
                        key={i}
                        marginY={1}
                      >
                        <fieldset>
                          <legend>{key}</legend>
                          <div>
                            {
                              Object.keys(group).map((subType, j) => {
                                const target = group[subType]
                                const values = []
                                if (target.value1)      values.push(target.value1)
                                if (target.value2)      values.push(target.value2)
                                return (
                                  <Fragment key={j}>
                                    <div>
                                      {
                                        subType && (
                                          <dt>
                                            <Typography color='rgb(185, 160, 130)'>{subType}</Typography>
                                          </dt>
                                        )
                                      }
                                      <Box
                                        display='inline-flex'
                                        flexDirection='row'
                                        columnGap={2}
                                        marginX={2}
                                      >
                                        {
                                          values.map((v, k) => (<dd key={k}>{v}</dd>))
                                        }
                                      </Box>
                                      {
                                        target.description && (
                                          <Box marginTop={1} marginBottom={2}>
                                            <dd>
                                              <Typography
                                                color='gray'
                                                fontSize='smaller'
                                              >{target.description}</Typography>
                                            </dd>
                                          </Box>
                                        )
                                      }
                                    </div>
                                  </Fragment>
                                )
                              })
                            }
                          </div>
                        </fieldset>
                      </Box>
                    )
                  })
                }
              </DefinitionList>
            </DialogContent>
          </Dialog>
        )
      }
      <FormControl disabled={pending}>
        <Box position='relative'>
          {
            pending && (
              <Box
                width='100%'
                height='calc(100vh - 100px)'
                position='absolute'
                top={0}
                left={0}
                display='flex'
                justifyContent='center'
                alignItems='center'
              >
                <CircularProgress size={100} />
              </Box>
            )
          }
          <Box sx={{ opacity: pending ? 0.3 : 1 }}>
            <DataGrid
              density='compact'
              sx={{
                fontFamily: 'Mabinogi',
                my: 1,
                '& .MuiDataGrid-cell': {
                  cursor: 'pointer',
                  '&:focus': {
                    outline: 'none'
                  }
                }
              }}
              rows={list}
              columns={Columns}
              onRowClick={(params) => select(params.row)}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10
                  }
                }
              }}
              pageSizeOptions={[10]}
              disableRowSelectionOnClick
              disableColumnResize
              disableColumnMenu
              editMode='row'
            />
          </Box>
        </Box>
      </FormControl>
    </>
  )
}
