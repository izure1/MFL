import { useContext, useState } from 'react'
import { css } from '@emotion/react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { SchemeMapContext } from './MacroProvider'
import MacroList from './MacroList'
import { ipc } from '../ipc'

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
      <Button
        variant='text'
        size='large'
        disableElevation
        onClick={handle}
        sx={{
          fontFamily: 'Mabinogi'
        }}
      >매크로</Button>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        sx={{
          backdropFilter: 'blur(9px)',
          '& .MuiDialog-paper': {
            backgroundImage: 'none',
            backgroundColor: 'rgb(24, 24, 26)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <div css={css`
            display: flex;
            flex-direction: row;
            align-items: center;
          `}>
            <div>매크로 관리</div>
            <div css={css`
              margin-left: 10px;
            `}>
              <Button size='small' onClick={handleAdd}>추가</Button>
            </div>
          </div>
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <hr css={css`
            height: 1px;
            border: 0;
            background: linear-gradient(90deg, transparent, rgb(225, 173, 145), transparent);
          `} /> 
          <MacroList schemeMap={schemeMap} />
        </DialogContent>
      </Dialog>
    </>
  )
}
