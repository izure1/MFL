import { useContext, useState } from 'react'
import { css } from '@emotion/react'
import { Box, Button, DialogContent, DialogTitle } from '@mui/material'
import { SchemeMapContext } from './MacroProvider.js'
import MacroList from './MacroList.js'
import { ipc } from '../ipc.js'
import BlurDialog from './advanced/BlurDialog.js'

export default function MacroButton() {
  const [open, setOpen] = useState(false)
  const schemeMap = useContext(SchemeMapContext)

  function handle() {
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
  }

  async function handleAdd() {
    const name = `새로운 매크로 ${new Date().toISOString()}`
    await ipc.macro.set(name, {
      name,
      trigger: null,
      type: 'once',
      units: []
    })
  }

  return (
    <>
      <BlurDialog
        open={open}
        onClose={handleClose}
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box
            display='flex'
            flexDirection='row'
            alignItems='center'
          >
            <div>매크로 관리</div>
            <Box marginLeft={1}>
              <Button size='small' onClick={handleAdd}>추가</Button>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <hr css={css`
            height: 1px;
            border: 0;
            background: linear-gradient(90deg, transparent, rgb(225, 173, 145), transparent);
          `} /> 
          <MacroList schemeMap={schemeMap} />
        </DialogContent>
      </BlurDialog>
      <Button
        size='small'
        disableElevation
        sx={{
          marginLeft: 2
        }}
        onClick={handle}
      >매크로 관리</Button>
    </>
  )
}
