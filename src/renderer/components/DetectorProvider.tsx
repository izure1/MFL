import React, { createContext, useEffect, useState, } from 'react'
import { ipc } from '../ipc.js'
import { IProcess } from '../../types/index.js'

export const context = createContext<IProcess|null>(null)

export default function MabinogiDetector({
  children
}: {
  children: React.ReactNode
}) {
  const [finding, setFinding] = useState(false)
  const [process, setProcess] = useState<IProcess|null>(null)

  async function findProcess() {
    if (finding) {
      return
    }
    setFinding(true)
    const guess = await ipc.process.mabinogi()
    setProcess(guess)
    setFinding(false)
  }

  useEffect(() => {
    const timeoutId = setTimeout(findProcess, 1000)
    const intervalId = setInterval(findProcess, 15000)
    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [])

  return (
    <context.Provider value={process}>
      {children}
    </context.Provider>
  )
}
