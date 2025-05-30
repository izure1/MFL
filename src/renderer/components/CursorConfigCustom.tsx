import type { ConfigScheme } from '../../types/index.js'
import { css } from '@emotion/react'
import { ChangeEvent, useState } from 'react'
import { Box, Button, DialogContent, DialogContentText, DialogTitle, FormControlLabel, Grid, Slider, Typography } from '@mui/material'
import { ipc } from '../ipc.js'
import Cursor from './Cursor.js'
import BlurDialog from './advanced/BlurDialog.js'
import { createDebounce } from '../../utils/timer.js'
import Android12Switch from './advanced/Android12Switch.js'

interface ColorPalette {
  name: string
  rgb: `rgb(${string},${string},${string})`|`${string}-gradient(${string})`
}

export default function CursorConfigCustom({
  config
}: {
  config: ConfigScheme
}) {
  const debounce = createDebounce(100)
  const [configOpen, setConfigOpen] = useState(false)
  const [thickness, setThickness] = useState(config.cursorThickness)
  const [size, setSize] = useState(config.cursorSize)

  const palettes: ColorPalette[][] = [
    [
      { name: '형광자주', rgb: 'rgb(192,0,192)' },
      { name: '핫핑크', rgb: 'rgb(199,25,103)' },
      { name: '빕리레', rgb: 'rgb(114,0,0)' },
      { name: '마룬', rgb: 'rgb(51,0,0)' },
    ],
    [
      { name: '와인', rgb: 'rgb(137,55,81)' },
      { name: '연분홍', rgb: 'rgb(255,170,170)' },
      { name: '벌리우드', rgb: 'rgb(220,191,151)' },
      { name: '가리화', rgb: 'rgb(240,240,240)' },
    ],
    [
      { name: '메론', rgb: 'rgb(152,226,148)' },
      { name: '형광민트', rgb: 'rgb(13,238,201)' },
      { name: '라데카', rgb: 'rgb(54,120,241)' },
      { name: '시암블랙', rgb: 'rgb(2,7,21)' },
    ],
    [
      { name: '빤지', rgb: 'linear-gradient(var(--colorful-gradient-angle), #ee7752, #e73c7e, #23a6d5, #23d5ab)' },
      { name: '빤지', rgb: 'linear-gradient(var(--colorful-gradient-angle), red, yellow, aqua, blue)' },
    ],
  ]

  function handleChange() {
    setConfigOpen(true)
  }

  function handleClose() {
    setConfigOpen(false)
  }

  function handleChangeCursorCrosshair(_e: ChangeEvent<HTMLInputElement>, cursorCrosshair: boolean) {
    debounce.execute('config', () => ipc.config.set({ cursorCrosshair }))
  }

  function handleChangeCursorThickness(_e: Event, cursorThickness: number) {
    setThickness(cursorThickness)
    debounce.execute('config', () => ipc.config.set({ cursorThickness }))
  }

  function handleChangeCursorSize(_e: Event, cursorSize: number) {
    setSize(cursorSize)
    debounce.execute('config', () => ipc.config.set({ cursorSize }))
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
                    defaultValue={config.cursorThickness}
                    value={thickness}
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
                    defaultValue={config.cursorSize}
                    value={size}
                    step={1}
                    min={10}
                    max={100}
                    valueLabelDisplay={'auto'}
                    onChange={handleChangeCursorSize}
                  />
                </Box>

                <Box>
                  <DialogContentText>
                    십자선
                    <FormControlLabel
                      sx={{ ml: 1 }}
                      label={config.cursorCrosshair ? '현재 사용 중' : '사용하지 않음'}
                      control={(
                        <Android12Switch
                          checked={config.cursorCrosshair}
                          onChange={handleChangeCursorCrosshair}
                        />
                      )}
                    />
                  </DialogContentText>
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
                                  background: color.rgb,
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
                  position: 'relative',
                }}>
                  <div
                    style={{
                      '--cursor-size': `${config.cursorSize}px`,
                      '--cursor-thickness': `${config.cursorThickness}px`,
                      '--cursor-color': config.cursorColor,
                    } as React.CSSProperties}
                    css={css`
                      width: var(--cursor-size);
                      height: var(--cursor-size);
                      position: relative;
                    `}
                  >
                    <Cursor
                      cursorColor={config.cursorColor}
                      cursorSize={config.cursorSize}
                      cursorThickness={config.cursorThickness}
                      x={config.cursorSize/2}
                      y={config.cursorSize/2}
                    />
                  </div>
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
