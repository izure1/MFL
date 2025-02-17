import type { ConfigScheme } from '../../types/index.js'
import { useState } from 'react'
import { Box, Button, DialogContent, DialogContentText, DialogTitle, Grid, Slider, Typography } from '@mui/material'
import { ipc } from '../ipc.js'
import Cursor from './Cursor.js'
import BlurDialog from './advanced/BlurDialog.js'

interface ColorPalette {
  name: string
  rgb: `rgb(${string},${string},${string})`
}

export default function CursorConfigCustom({
  config
}: {
  config: ConfigScheme
}) {
  const [configOpen, setConfigOpen] = useState(false)

  const palettes: ColorPalette[][] = [
    [
      { name: '빕분홍', rgb: 'rgb(255,170,170)' },
      { name: '쉬머분홍', rgb: 'rgb(249,166,252)' },
      { name: '딸기우유', rgb: 'rgb(255,129,211)' },
      { name: '핫핑크', rgb: 'rgb(199,25,103)' },
    ],
    [
      { name: '빕리레', rgb: 'rgb(114,0,0)' },
      { name: '와인', rgb: 'rgb(137,55,81)' },
      { name: '엔틱화이트', rgb: 'rgb(223,213,210)' },
      { name: '벌리우드', rgb: 'rgb(220,191,151)' },
    ],
    [
      { name: '살구', rgb: 'rgb(234,158,113)' },
      { name: '바나나', rgb: 'rgb(255,224,98)' },
      { name: '진리골', rgb: 'rgb(242,163,58)' },
      { name: '초콜릿', rgb: 'rgb(179,112,69)' },
    ],
    [
      { name: '시스템다크레드', rgb: 'rgb(57,19,26)' },
      { name: '메론', rgb: 'rgb(152,226,148)' },
      { name: '형광민트', rgb: 'rgb(13,238,201)' },
      { name: '다크시안', rgb: 'rgb(52,118,145)' },
    ],
    [
      { name: '이웨카', rgb: 'rgb(90,149,245)' },
      { name: '형광자주', rgb: 'rgb(192,0,192)' },
      { name: '발레스검보라', rgb: 'rgb(50,37,60)' },
      { name: '시암블랙', rgb: 'rgb(2,7,21)' },
    ],
  ]

  function handleChange() {
    setConfigOpen(true)
  }

  function handleClose() {
    setConfigOpen(false)
  }

  async function handleChangeCursorThickness(_e: Event, cursorThickness: number) {
    await ipc.config.set({ cursorThickness })
  }

  async function handleChangeCursorSize(_e: Event, cursorSize: number) {
    await ipc.config.set({ cursorSize })
  }

  async function handleChangeCursorColor(
    _e: React.MouseEvent<HTMLDivElement>,
    cursorColor: string
  ) {
    await ipc.config.set({ cursorColor })
  }

  return (
    <>
      <BlurDialog
        open={configOpen}
        onClose={handleClose}
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle>커서 꾸미기</DialogTitle>
        <DialogContent>
          <Grid container columns={10}>
            {/* 설정 */}
            <Grid item xs={6}>
              <DialogContentText>
                게임 내에서 보일 커서의 모양을 꾸밀 수 있습니다.
                <br />
                우측에서 미리보기를 할 수 있습니다.
              </DialogContentText>

              <Box sx={{ mt: 2 }}>
                <DialogContentText>
                  굵기
                </DialogContentText>
                <Box>
                  <Slider
                    value={config.cursorThickness}
                    step={1}
                    min={1}
                    max={10}
                    valueLabelDisplay={'auto'}
                    onChange={handleChangeCursorThickness}
                  />
                </Box>

                <DialogContentText>
                  크기
                </DialogContentText>
                <Box>
                  <Slider
                    value={config.cursorSize}
                    step={1}
                    min={10}
                    max={100}
                    valueLabelDisplay={'auto'}
                    onChange={handleChangeCursorSize}
                  />
                </Box>

                <DialogContentText>
                  색상
                </DialogContentText>
                <Box sx={{ mt: 1 }}>
                  <Grid container direction={'column'} columns={4}>
                    {
                      palettes.map((palette, i) => (
                        <Grid
                          key={i}
                          container
                          item
                          direction={'row'}
                          columns={4}
                          xs={1}
                        >
                          {
                            palette.map((color) => (
                              <Grid
                                key={color.rgb}
                                item
                                xs={1}
                                sx={{
                                  height: '30px',
                                  backgroundColor: color.rgb,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                }}
                              >
                                <div onClick={(_e) => handleChangeCursorColor(_e, color.rgb)}>
                                  <Typography fontSize={'0.75em'} sx={{
                                    lineHeight: '30px',
                                    textAlign: 'center',
                                  }}>
                                    {color.name}
                                  </Typography>
                                </div>
                              </Grid>
                            ))
                          }
                        </Grid>
                      ))
                    }
                  </Grid>
                </Box>
              </Box>
            </Grid>

            {/* 미리보기 */}
            <Grid item xs sx={{
              ml: 2
            }}>
              <Grid container height={'100%'} direction={'column'}>
                <Grid container item sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <DialogContentText>미리보기</DialogContentText>
                </Grid>
                <Grid container item xs sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Cursor
                    cursorColor={config.cursorColor}
                    cursorSize={config.cursorSize}
                    cursorThickness={config.cursorThickness}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
      </BlurDialog>
      <Button
        size='small'
        disableElevation
        sx={{
          marginLeft: 2
        }}
        onClick={handleChange}
      >커서 꾸미기</Button>
    </>
  )
}
