import React, { createContext, useEffect, useState } from 'react'
import { ConfigScheme } from '../../../src/types/index.js'
import { ipc } from '../ipc.js'

export const ConfigContext = createContext<ConfigScheme|null>(null)

export default function ConfigProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [config, setConfig] = useState<ConfigScheme|null>(null)

  async function fetchConfig() {
    return await ipc.config.get()
  }

  function listen() {
    ipc.config.onUpdate(setConfig)
  }

  useEffect(() => {
    fetchConfig().then(setConfig)
    listen()
  }, [])

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  )
}
