import type { UiohookKeyboardEvent, UiohookMouseEvent } from 'uiohook-napi'
import type { IOEvent, MacroDelayUnit, MacroIOUnit, MacroScheme } from '../../types/index.js'
import { useContext, useEffect, useState } from 'react'
import { css } from '@emotion/react'
import { List, ListItemButton, ListItem } from '@mui/material'
import {
  Add as AddIcon,
  FiberManualRecord as FiberManualRecordIcon
} from '@mui/icons-material'
import { HoveringContext, RecordingContext, SchemeContext } from './MacroEditor.js'
import MacroUnitRawButton from './MacroUnitRawButton.js'
import { createDelayUnit, createKeyboardUnit, createMouseUnit } from './MacroUnitButton.js'
import { ipc } from '../ipc.js'

export default function MacroModeManager() {
  const scheme = useContext(SchemeContext)
  const [hovering] = useContext(HoveringContext)
  const [recording, setRecording] = useContext(RecordingContext)
  const [modeShowing, setModeShowing] = useState(false)

  async function updateMacro(name: string, scheme: MacroScheme): Promise<MacroScheme> {
    const context = await ipc.macro.set(name, scheme)
    return context
  }
  
  function onReceiveKeyboard(e: UiohookKeyboardEvent) {
    const unit = createKeyboardUnit(e)
    const units = [...scheme.units, unit]
    updateMacro(scheme.name, { ...scheme, units })
  }

  function onReceiveMouse(e: UiohookMouseEvent) {
    if (hovering) {
      return
    }
    const unit = createMouseUnit(e)
    if (unit.button > 3) {
      return
    }
    const units = [...scheme.units, unit]
    updateMacro(scheme.name, { ...scheme, units })
  }

  function handleIOReceive(e: IOEvent) {
    switch (e.type) {
      case 'keyboard': return onReceiveKeyboard(e.original)
      case 'mouse': return onReceiveMouse(e.original)
    }
  }

  function onIOReceive(e: IOEvent) {
    if (!scheme || !recording) {
      return
    }
    handleIOReceive(e)
  }

  function addDelay(duration: number) {
    const unit = createDelayUnit(duration)
    const units = [...scheme.units, unit]
    ipc.macro.set(scheme.name, { ...scheme, units })
  }

  useEffect(() => () => setRecording(false), [])
  useEffect(() => {
    const fn = ipc.io.on(onIOReceive)
    return () => {
      ipc.io.off(fn)
    }
  }, [scheme, recording, hovering])

  if (recording) {
    function handleStopRecording() {
      setRecording(false)
    }
    return (
      <MacroUnitRawButton
        context={<FiberManualRecordIcon color='error' />}
        onClick={handleStopRecording}
      />
    )
  }

  if (!modeShowing) {
    return (
      <MacroUnitRawButton
        context={<AddIcon />}
        onClick={() => setModeShowing(true)}
      />
    )
  }

  if (modeShowing) {
    const jobs = [
      {
        id: 'record',
        text: '캡쳐',
        onClick: () => {
          setModeShowing(false)
          setRecording(true)
        }
      },
      {
        id: 'delay',
        text: '대기',
        onClick: () => {
          setModeShowing(false)
          setRecording(false)
          addDelay(1000)
        }
      },
      {
        id: 'cancel',
        text: '취소',
        onClick: () => {
          setModeShowing(false)
          setRecording(false)
        }
      }
    ]
    return (
      <div css={css`
        border: 1px solid gray;
      `}>
        <List dense>
          {
            jobs.map((job) => (
              <ListItemButton key={job.id} onClick={job.onClick}>
                <ListItem>{job.text}</ListItem>
              </ListItemButton>
            ))
          }
        </List>
      </div>
    )
  }
}
