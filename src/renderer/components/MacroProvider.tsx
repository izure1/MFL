import type { MacroSchemeMap } from '../../types/index.js'
import { createContext, useEffect, useState } from 'react'
import { ipc } from '../ipc.js'

export const SchemeMapContext = createContext<MacroSchemeMap>({})

export default function MacroProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [schemeMap, setSchemeMap] = useState<MacroSchemeMap>({})

  function fetchSchemeMap() {
    ipc.macro.getMap().then(setSchemeMap)
  }

  function listen() {
    ipc.macro.onUpdate(setSchemeMap)
  }

  useEffect(() => {
    fetchSchemeMap()
    listen()
  }, [])

  return (
    <SchemeMapContext.Provider value={schemeMap}>
      {children}
    </SchemeMapContext.Provider>
  )
}
