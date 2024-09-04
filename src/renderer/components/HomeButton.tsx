import Button from '@mui/material/Button'
import { ipc } from '../ipc'

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
      sx={{
        fontFamily: 'Mabinogi'
      }}
    >폴더</Button>
  )
}
