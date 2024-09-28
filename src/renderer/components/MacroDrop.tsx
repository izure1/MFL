import { useContext, useMemo } from 'react'
import { Button, Dialog, DialogContent, DialogContentText, DialogActions, DialogTitle } from '@mui/material'
import { SchemeMapContext } from './MacroProvider.js'
import { ipc } from '../ipc.js'

export default function MacroDrop({
  target,
  setTarget,
}: {
  target: string
  setTarget: (target: string) => void
}) {
  const schemeMap = useContext(SchemeMapContext)
  const confirming = useMemo(() => target !== null, [target])

  async function handleDelete() {
    if (target === null) {
      return
    }
    const scheme = schemeMap[target]
    if (!scheme) {
      return
    }
    await ipc.macro.remove(scheme.name)
    setTarget(null)
  }

  return (
    <Dialog
      open={confirming}
      onClose={() => setTarget(null)}
    >
      <DialogTitle>{target}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          이 매크로를 정말로 삭제하시겠습니까?
          <br />
          이 작업은 되돌릴 수 없습니다.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDelete}>네</Button>
        <Button onClick={() => setTarget(null)}>아니오</Button>
      </DialogActions>
    </Dialog>
  )
}
