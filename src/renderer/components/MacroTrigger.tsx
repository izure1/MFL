import type { IOEvent, IOKeyboardEvent, IOMouseEvent, MacroScheme } from '../../types/index.js'
import { useContext, useEffect } from 'react'
import {
  Add as AddIcon,
  FiberManualRecord as FiberManualRecordIcon
} from '@mui/icons-material'
import { HoveringContext, SchemeContext, TriggerRecordingContext } from './MacroEditor.js'
import { createKeyboardUnit, createMacroIcon, createMacroIconData, createMouseUnit } from './MacroUnitButton.js'
import MacroUnitRawButton from './MacroUnitRawButton.js'
import { ipc } from '../ipc.js'

export default function MacroTrigger() {
  const scheme = useContext(SchemeContext)
  const [hovering] = useContext(HoveringContext)
  const [triggerRecording, setTriggerRecording] = useContext(TriggerRecordingContext)

  function handleRecord() {
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
