import { Button } from '@mui/material'
import { ipc } from '../ipc.js'

export default function HomeButton() {
  function handle() {
    ipc.app.directoryOpen()
  }

  return (
    <Button
      variant='text'
      size='large'
      disableElevation
      onClick={handle}
    >폴더</Button>
  )
}
