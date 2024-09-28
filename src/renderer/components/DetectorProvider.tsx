import React, { createContext, useEffect, useState, } from 'react'
import { ipc } from '../ipc.js'
import { IProcess } from '../../types/index.js'

export const context = createContext<IProcess|null>(null)

export default function MabinogiDetector({
  children
}: {
  children: React.ReactNode
}) {
  const [process, setProcess] = useState<IProcess|null>(null)

  async function findProcess() {
    const guess = await ipc.process.mabinogi()
    setProcess(guess)
  }

  useEffect(() => {
    findProcess()
    const id = setInterval(findProcess, 10000)
    return () => {
      clearInterval(id)
    }
  }, [])

  return (
    <context.Provider value={process}>
      {children}
    </context.Provider>
  )
}
