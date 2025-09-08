import React, { createContext, useEffect, useState } from 'react'
import { AuctionItemWatchScheme, AuctionWantedItemScheme } from '../../types/index.js'
import AuctionWatchEditor from './auction/AuctionWatchEditor.js'
import { ipc } from '../ipc.js'

export const AuctionWatchContext = createContext<{
  category: string
  setCategory: React.Dispatch<React.SetStateAction<string>>
  watchData: AuctionItemWatchScheme
  setWatchData: React.Dispatch<React.SetStateAction<AuctionItemWatchScheme>>
  watchEditorOpen: boolean
  setWatchEditorOpen: React.Dispatch<React.SetStateAction<boolean>>
  nonInspectedItems: AuctionWantedItemScheme[]
  requestFetchNonInspectItems: () => Promise<void>
}>(null)

export default function AuctionWatchProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [category, setCategory] = useState('')
  const [watchData, setWatchData] = useState<AuctionItemWatchScheme>(null)
  const [watchEditorOpen, setWatchEditorOpen] = useState(false)
  const [nonInspectedItems, setNonInspectedItems] = useState<AuctionWantedItemScheme[]>([])

  async function listen() {
    ipc.auction.onNonInspectUpdate(setNonInspectedItems)
  }

  async function requestFetchNonInspectItems() {
    ipc.auction.getNonInspected().then(setNonInspectedItems)
  }

  useEffect(() => {
    requestFetchNonInspectItems()
    listen()
  }, [])

  return (
    <AuctionWatchContext.Provider value={{
      category,
      setCategory,
      watchData,
      setWatchData,
      watchEditorOpen,
      setWatchEditorOpen,
      nonInspectedItems,
      requestFetchNonInspectItems,
    }}>
      <AuctionWatchEditor
        data={watchData}
        open={watchEditorOpen}
        onClose={() => setWatchEditorOpen(false)}
      />
      {children}
    </AuctionWatchContext.Provider>
  )
}
