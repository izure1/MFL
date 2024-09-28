import type { MacroScheme, MacroUnit } from '../../types/index.js'
import { css } from '@emotion/react'
import { createContext, Dispatch, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography
} from '@mui/material'
import { ReactSortable } from 'react-sortablejs'
import MacroUnitButton from './MacroUnitButton.js'
import MacroModeManager from './MacroModeManager.js'
import MacroTrigger from './MacroTrigger.js'
import { SchemeMapContext } from './MacroProvider.js'
import { ipc } from '../ipc.js'
import MacroType from './MacroType.js'

export const SchemeContext = createContext<MacroScheme|null>({
  name: 'Unknown',
  type: 'once',
  trigger: null,
  units: []
})
export const TriggerRecordingContext = createContext<[boolean, Dispatch<boolean>]>([
  false,
  (v: boolean) => {}
])
export const RecordingContext = createContext<[boolean, Dispatch<boolean>]>([
  false,
  (v: boolean) => {}
])
export const HoveringContext = createContext<[boolean, Dispatch<boolean>]>([
  false,
  (v: boolean) => {}
])

export default function MacroEditor({
  target,
  setTarget,
}: {
  target: string
  setTarget: (target: string) => void
}) {
  const schemeMap = useContext(SchemeMapContext)
  const editing = useMemo(() => target !== null, [target])
  const scheme = useMemo(() => {
    if (target === null) {
      return null
    }
    return schemeMap[target] ?? null
  }, [target, schemeMap])

  const triggerRecordingContext = useState(false)
  const unitRecordingContext = useState(false)
  const hoveringContext = useState(false)

  async function updateMacro(scheme: MacroScheme): Promise<MacroScheme> {
    const context = await ipc.macro.set(target, scheme)
    return context
  }

  function handleSortList(units: MacroUnit[]) {
    const newScheme = {
      ...scheme,
      units
    }
    updateMacro(newScheme)
  }

  const [nameInputOpen, setNameInputOpen] = useState(false)
  const [namePending, setNamePending] = useState(false)
  const [nameInputError, setNameInputError] = useState('')
  const nameInputRef = useRef(null)
  async function handleChangeName() {
    const el = nameInputRef?.current
    if (!el) {
      return
    }
    setNameInputError('')
    const name = el.value || scheme.name
    if (name !== target && Object.hasOwn(schemeMap, name)) {
      setNameInputError('이미 존재하는 매크로 이름입니다')
      return
    }
    setNamePending(true)
    await ipc.macro.set(scheme.name, { ...scheme, name })
    setNamePending(false)
    setNameInputOpen(false)
    setTarget(name)
  }

  function handleUnitChange(unit: MacroUnit) {
    const index = scheme.units.findIndex((u) => u.id === unit.id)
    if (index === -1) {
      return
    }
    const newUnits = scheme.units.toSpliced(index, 1, unit)
    const newScheme: MacroScheme = {
      ...scheme,
      units: newUnits
    }
    updateMacro(newScheme)
  }

  function handleUnitDelete(unit: MacroUnit) {
    const index = scheme.units.findIndex((u) => u.id === unit.id)
    if (index === -1) {
      return
    }
    const newUnits = scheme.units.toSpliced(index, 1)
    const newScheme: MacroScheme = {
      ...scheme,
      units: newUnits
    }
    updateMacro(newScheme)
  }

  useEffect(() => {
    setNameInputError('')
  }, [nameInputOpen])

  const [unitRecording] = unitRecordingContext
  const [triggerRecording] = triggerRecordingContext
  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (unitRecording || triggerRecording) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    const onKeyup = (e: KeyboardEvent) => {
      if (unitRecording || triggerRecording) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    document.addEventListener('keydown', onKeydown, true)
    document.addEventListener('keyup', onKeyup, true)

    return () => {
      document.removeEventListener('keydown', onKeydown, true)
      document.removeEventListener('keyup', onKeyup, true)
    }
  }, [unitRecording, triggerRecording])

  return (
    <SchemeContext.Provider value={scheme}>
      <TriggerRecordingContext.Provider value={triggerRecordingContext}>
        <RecordingContext.Provider value={unitRecordingContext}>
          <HoveringContext.Provider value={hoveringContext}>
            {
              scheme && (
                <Dialog
                  open={nameInputOpen}
                  onClose={() => setNameInputOpen(false)}
                  maxWidth='xl'
                  fullWidth
                >
                  <DialogTitle>새로운 매크로 이름을 입력하세요</DialogTitle>
                  <DialogContent>
                    <TextField
                      inputRef={nameInputRef}
                      type='text'
                      variant='outlined'
                      defaultValue={scheme.name}
                      error={!!nameInputError}
                      helperText={nameInputError}
                      fullWidth
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button
                      variant='text'
                      disabled={namePending}
                      onClick={handleChangeName}
                      fullWidth
                    >저장</Button>
                  </DialogActions>
                </Dialog>
              )
            }
            <Dialog
              open={editing}
              onClose={() => setTarget(null)}
              fullScreen
            >
              <DialogTitle>
                <Button
                  variant='text'
                  size='large'
                  onClick={() => setNameInputOpen(true)}
                >{target}</Button>
              </DialogTitle>
              <DialogContent>
                <div css={css`
                  min-height: 100px;
                  margin-bottom: 10px;
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  & > div {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                  }
                `}>
                  <div>
                    <div>
                      <Typography>실행될 조건. 우클릭으로 삭제할 수 있습니다</Typography>
                    </div>
                    <div>
                      <MacroTrigger />
                    </div>
                  </div>
                  <div>
                    <div>
                      <Typography>작동 방식을 선택하세요</Typography>
                    </div>
                    <div>
                      <MacroType />
                    </div>
                  </div>
                </div>
                <Typography>실행될 동작. 우클릭으로 삭제할 수 있습니다</Typography>
                <div css={css`
                  margin-top: 30px;
                `}>
                  {scheme ? (
                    <ReactSortable
                      list={scheme.units}
                      setList={handleSortList}
                      direction='horizontal'
                      css={css`
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(50px, 100px));
                        row-gap: 10px;
                        column-gap: 20px;
                      `}
                      draggable='.macro-unit'
                    >
                      {scheme.units.map((unit) => (
                        <MacroUnitButton
                          key={unit.id}
                          scheme={scheme}
                          unit={unit}
                          className='macro-unit'
                          onChange={handleUnitChange}
                          onDelete={handleUnitDelete}
                        />
                      ))}
                      <MacroModeManager />
                    </ReactSortable>
                  ) : (
                    <MacroModeManager />
                  )}
                </div>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setTarget(null)}>돌아가기</Button>
              </DialogActions>
            </Dialog>
          </HoveringContext.Provider>
        </RecordingContext.Provider>
      </TriggerRecordingContext.Provider>
    </SchemeContext.Provider>
  )
}
