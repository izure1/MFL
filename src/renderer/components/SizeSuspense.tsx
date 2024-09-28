import type { GlobOptions } from '../../types/index.js'
import { useEffect, useMemo, useState } from 'react'
import _byteSize from 'byte-size'
import { ipc } from '../ipc.js'

const byteSize = _byteSize as unknown as typeof _byteSize['default']

export default function SizeSuspense({
  pattern,
  option,
  filter = () => true,
  updatedAt = 0
}: {
  pattern: string
  option: GlobOptions
  filter?: (itemPath: string) => boolean
  updatedAt?: number
}) {
  const [calculated, setCalculated] = useState(false)
  const [size, setSize] = useState(0)
  const humanReadableSize = useMemo(() => byteSize(size).toString(), [size])

  option.absolute = true
  const {
    cwd = './',
    onlyFiles = false,
    onlyDirectories = false,
    ignore = []
  } = option

  async function fetchSize() {
    setCalculated(false)
    const all = await ipc.fs.glob(pattern, option)
    const result = await ipc.fs.getItemSize(all.filter(filter))
    setSize(Number(result))
    setCalculated(true)
  }

  useEffect(() => {
    fetchSize()
  }, [
    pattern,
    cwd,
    onlyFiles,
    onlyDirectories,
    ignore.join(','),
    filter,
    updatedAt
  ])

  return (
    <>
      { calculated ? humanReadableSize : '읽어오는 중...' }
    </>
  )
}
