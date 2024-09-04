import type { IOEvent, IOKeyboardEvent, IOMouseEvent, MacroIOUnit, MacroScheme, MacroUnit } from '../../types'
import { useContext, useEffect } from 'react'
import AddIcon from '@mui/icons-material/Add'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import { HoveringContext, RecordingContext, SchemeContext, TriggerRecordingContext } from './MacroEditor'
import MacroUnitButton, { createKeyboardUnit, createMacroIcon, createMacroIconData, createMouseUnit } from './MacroUnitButton'
import MacroUnitRawButton from './MacroUnitRawButton'
import { ipc } from '../ipc'

export default function MacroTrigger() {
  const scheme = useContext(SchemeContext)
  const [hovering, setHovering] = useContext(HoveringContext)
  const [unitRecording, setUnitRecording] = useContext(RecordingContext)
  const [triggerRecording, setTriggerRecording] = useContext(TriggerRecordingContext)

  function handleRecord() {
    setUnitRecording(false)
    setTriggerRecording(true)
  }

  function handleStopRecord() {
    setTriggerRecording(false)
  }

  async function updateMacro(newScheme: MacroScheme): Promise<MacroScheme> {
    const context = await ipc.macro.set(scheme.name, newScheme)
    return context
  }

  function onReceiveKeyboard(e: IOKeyboardEvent) {
    const unit = createKeyboardUnit(e.original)
    unit.toggle = 'down'
    updateMacro({ ...scheme, trigger: unit })
  }
  
  function onReceiveMouse(e: IOMouseEvent) {
    const unit = createMouseUnit(e.original)
    unit.toggle = 'down'
    updateMacro({ ...scheme, trigger: unit })
  }

  function onIOReceive(e: IOEvent) {
    if (!triggerRecording) {
      return
    }
    switch (e.type) {
      case 'keyboard': {
        setTriggerRecording(false)
        return onReceiveKeyboard(e)
      }
      case 'mouse': {
        if (hovering) {
          return
        }
        setTriggerRecording(false)
        return onReceiveMouse(e)
      }
    }
  }

  function handleMousedown(e: React.MouseEvent) {
    if (e.button !== 2) {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    handleDelete()
  }
  
  function handleDelete() {
    setTriggerRecording(false)
    updateMacro({ ...scheme, trigger: null })
  }

  useEffect(() => () => setTriggerRecording(false), [])
  useEffect(() => {
    const fn = ipc.io.on(onIOReceive)
    return () => {
      ipc.io.off(fn)
    }
  }, [triggerRecording, hovering])

  return (
    scheme && scheme.trigger ? (
      <MacroUnitRawButton
        context={createMacroIcon(createMacroIconData(scheme.trigger))}
        onClick={() => {}}
        onMouseDown={handleMousedown}
      />
    ) : (
      triggerRecording ? (
        <MacroUnitRawButton
          context={<FiberManualRecordIcon color='error' />}
          onClick={handleStopRecord}
        />
      ) : (
        <MacroUnitRawButton
          context={<AddIcon />}
          onClick={handleRecord}
        />
      )
    )
  )
}
