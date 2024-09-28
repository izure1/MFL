import type { MacroScheme } from '../../types/index.js'
import { useContext } from 'react'
import { FormControl, FormControlLabel, RadioGroup, Radio } from '@mui/material'
import { SchemeContext } from './MacroEditor.js'
import { ipc } from '../ipc.js'

export default function MacroType() {
  const scheme = useContext(SchemeContext)
  
  function updateMacro(scheme: MacroScheme) {
    ipc.macro.set(scheme.name, scheme)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const type = e.target.value as MacroScheme['type']
    updateMacro({ ...scheme, type })
  }

  return (
    scheme && (
      <FormControl variant='standard'>
        <RadioGroup defaultValue={scheme.type} onChange={handleChange} row>
          <FormControlLabel value='once' control={<Radio />} label='한번만' />
          <FormControlLabel value='while' control={<Radio />} label='누르고 있는 동안' />
          <FormControlLabel value='repeat' control={<Radio />} label='다시 누를 때 까지 반복' />
        </RadioGroup>
      </FormControl>
    )
  )
}
