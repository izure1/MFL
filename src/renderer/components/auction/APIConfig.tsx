import { ChangeEvent, useEffect, useState } from 'react'
import { Box, Button, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material'
import { ipc } from '../../ipc.js'
import AuctionConfig from '../../../config/auction/api.json' with { type: 'json' }
import BlurDialog from '../advanced/BlurDialog.js'

export default function APIConfig({
  apiKey
}: {
  apiKey: string
}) {
  const [open, setOpen] = useState(false)
  const [newApiKey, setNewApiKey] = useState(apiKey)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setNewApiKey(e.target.value)
  }

  async function handleSave() {
    await ipc.config.set({ apiKey: newApiKey })
    setOpen(false)
  }

  function goto(url: string) {
    ipc.external.open(url)
  }

  useEffect(() => {
    setNewApiKey(apiKey)
  }, [apiKey])

  const { register_url, description_url } = AuctionConfig

  return (
    <>
      <BlurDialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
      >
        <DialogTitle>마비노기 API 설정</DialogTitle>
        <DialogContent>
          <DialogContentText>
            마비노기 경매장을 이용하기 위해서 API키를 설정해야합니다.
            <br />
            <Button
              color='secondary'
              onClick={() => goto(description_url)}
              sx={{ ml: -1 }}
            >애플리케이션 등록 가이드</Button>를 참고하여 새로운 마비노기 애플리케이션을 등록하세요.
            <br />
            이후, 애플리케이션 API키를 등록하세요.
          </DialogContentText>
          <Box marginTop={3}>
            <TextField
              placeholder='live_***'
              defaultValue={apiKey}
              fullWidth
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Box
            width='100%'
            display='flex'
            flexDirection='column'
          >
            <Button onClick={handleSave}>저장하기</Button>
          </Box>
        </DialogActions>
      </BlurDialog>

      <Button
        variant='outlined'
        color={ apiKey ? 'primary' : 'error' }
        onClick={() => setOpen(true)}
      >
        API 키 설정
      </Button>
    </>
  )
}