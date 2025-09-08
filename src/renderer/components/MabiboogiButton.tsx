import { Button } from '@mui/material'
import { ipc } from '../ipc.js'

export default function MabiboogiButton() {
  function openExternal(url: string): void {
    ipc.external.open(url)
  }
  return (
    <>
      <Button
        variant='text'
        size='large'
        disableElevation
        onClick={() => openExternal('https://ledger.izure.org/calculator')}
      >분배 계산기</Button>
    </>
  )
}
