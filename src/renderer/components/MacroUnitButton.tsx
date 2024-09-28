import type { UiohookKeyboardEvent, UiohookMouseEvent } from 'uiohook-napi'
import type { IOEvent, MacroDelayUnit, MacroIOUnit, MacroScheme, MacroUnit } from '../../types/index.js'
import { useState } from 'react'
import { css } from '@emotion/react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography
} from '@mui/material'
import {
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon
} from '@mui/icons-material'
import MacroUnitRawButton from './MacroUnitRawButton.js'
import { fromLinuxKeycode } from '../../utils/keycode.js'
import { createUUIDV4 } from '../../utils/id.js'

export function createMacroIconData(unit: MacroUnit) {
  let text: string
  let toggle: React.ReactNode
  let togglePosition: 'top'|'bottom'

  switch (unit.hardware) {
    case 'keyboard': {
      const key = fromLinuxKeycode(unit.button) ?? 'unknown'
      text = key.charAt(0).toUpperCase() + key.slice(1)
      break
    }
    case 'mouse': {
      text = `M:${unit.button.toString()}`
      break
    }
    case 'delay': {
      text = `${unit.duration}ms`
      break
    }
  }
  switch (unit.toggle) {
    case 'down': {
      toggle = <ArrowDropDownIcon fontSize='medium' />
      togglePosition = 'bottom'
      break
    }
    case 'up': {
      toggle = <ArrowDropUpIcon fontSize='medium' />
      togglePosition = 'top'
      break
    }
  }
  return {
    text,
    toggle,
    togglePosition,
  }
}

export function createMacroIcon({
  toggle,
  togglePosition,
  text,
}: {
  toggle: React.ReactNode,
  togglePosition: string,
  text: string
}): React.ReactNode {
  return (
    <div css={css`
      width: 100%;
      height: 100%;
      position: relative;
    `}>
      <div css={css`
        width: 100%;
        color: orange;
        display: flex;
        justify-content: center;
        position: absolute;
        left: 0;
        ${togglePosition}: -10px;
      `}>
        {toggle}
      </div>
      <div css={css`
        width: 100%;
        height: 100%;
        display: flex;
        flex: 1 0;
        align-items: center;
        justify-content: center;
        z-index: 1;
        position: relative;
      `}>
        <Typography
          fontSize={20}
          letterSpacing={-1}
          textAlign='center'
          color='white'
          lineHeight={1}
        >{text}</Typography>
      </div>
    </div>
  )
}

export function createKeyboardUnit(e: UiohookKeyboardEvent): MacroIOUnit {
  const button = e.keycode as number
  const type = e.type as number
  return {
    hardware: 'keyboard',
    id: createUUIDV4(),
    button,
    toggle: type === 4 ? 'down' : 'up',
  }
}

export function createMouseUnit(e: UiohookMouseEvent): MacroIOUnit {
  const button = e.button as number
  const type = e.type as number
  return {
    hardware: 'mouse',
    id: createUUIDV4(),
    button,
    toggle: type === 7 ? 'down' : 'up',
  }
}

export function createDelayUnit(duration: number): MacroDelayUnit {
  return {
    hardware: 'delay',
    id: createUUIDV4(),
    duration,
  }
}

export function createMacroUnit(e: IOEvent) {
  switch (e.type) {
    case 'keyboard': return createKeyboardUnit(e.original)
    case 'mouse': return createMouseUnit(e.original)
  }
}

export default function MacroUnitButton({
  scheme,
  unit,
  onChange,
  onDelete,
  className,
}: {
  scheme: MacroScheme
  unit: MacroUnit
  onChange: (unit: MacroUnit) => void
  onDelete: (unit: MacroUnit) => void
  className?: string
}) {
  const data = createMacroIconData(unit)
  const context = createMacroIcon(data)
  
  async function handleDelete(e: React.MouseEvent) {
    if (e.button !== 2) {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    onDelete(unit)
  }

  const [delayInputOpen, setDelayInputOpen] = useState(false)
  const [toggleInputOpen, setToggleInputOpen] = useState(false)

  function handleToggleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const toggle = e.target.value as MacroIOUnit['toggle']
    const newUnit = { ...unit, toggle }
    onChange(newUnit)
  }

  function handleDelayInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    let duration = Number(e.target.value) || 0
    if (duration < 0) {
      duration = 0
    }
    const newUnit = { ...unit, duration }
    onChange(newUnit)
  }

  function onDelayUnitClick() {
    setDelayInputOpen(true)
  }

  function onMouseUnitClick() {
    setToggleInputOpen(true)
  }
  
  function onKeyboardUnitClick() {
    setToggleInputOpen(true)
  }
  
  function handleOnClick() {
    switch (unit.hardware) {
      case 'delay': return onDelayUnitClick()
      case 'keyboard': return onKeyboardUnitClick()
      case 'mouse': return onMouseUnitClick()
    }
  }

  return (
    <>
      {
        unit.hardware === 'delay' && (
          <Dialog
            open={delayInputOpen}
            onClose={() => setDelayInputOpen(false)}
          >
            <DialogTitle>값 입력</DialogTitle>
            <DialogContent>
              <div>
                <input type='number'
                  placeholder='숫자를 입력하세요'
                  value={unit.duration}
                  onChange={handleDelayInputChange}
                />
              </div>
            </DialogContent>
          </Dialog>
        )
      }
      {
        (unit.hardware === 'mouse' || unit.hardware === 'keyboard') && (
          <Dialog
            open={toggleInputOpen}
            onClose={() => setToggleInputOpen(false)}
          >
            <DialogTitle>값 입력</DialogTitle>
            <DialogContent>
              <FormControl variant='standard'>
                <RadioGroup defaultValue={unit.toggle} onChange={handleToggleInputChange}>
                  <FormControlLabel value='up' control={<Radio />} label='땜' />
                  <FormControlLabel value='down' control={<Radio />} label='누름' />
                </RadioGroup>
              </FormControl>
            </DialogContent>
          </Dialog>
        )
      }
      <MacroUnitRawButton
        context={context}
        className={className}
        onClick={handleOnClick}
        onMouseDown={handleDelete}
      />
    </>
  )
}
