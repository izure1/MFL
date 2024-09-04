import type { MacroScheme } from '../../types'
import { useContext } from 'react'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import { SchemeContext } from './MacroEditor'
import { ipc } from '../ipc'

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
