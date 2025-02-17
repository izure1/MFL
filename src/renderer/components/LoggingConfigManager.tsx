import type { ConfigScheme } from '../../types/index.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import { basename } from 'path-browserify'
import _byteSize from 'byte-size'
import { getLoggingDistDirectory } from '../../helpers/logger.js'
import { createThrottling } from '../../utils/timer.js'
import { ipc } from '../ipc.js'
import BlurDialog from './advanced/BlurDialog.js'


const byteSize = _byteSize as unknown as typeof _byteSize['default']

function fileOlderThan(itemPath: string, olderThan: number) {
  const name = basename(itemPath, '.webp')
  const rawTimestamp = name.split('_')[0]
  const timestamp = Number(rawTimestamp)
  if (!timestamp) {
    return false
  }
  return timestamp < olderThan
}

function FileSizeOlderThan({
  allFiles,
  olderThan,
  totalSize
}: {
  allFiles: string[]
  olderThan: number
  totalSize: number
}) {
  const filteredFiles = useMemo(() => {
    return allFiles.filter((t) => fileOlderThan(t, olderThan))
  }, [allFiles])

  const rate = useMemo(() => filteredFiles.length / allFiles.length, [filteredFiles])

  const filteredSize = useMemo(() => {
    if (Number.isNaN(rate)) {
      return '읽어오는 중...'
    }
    const size = Math.ceil(totalSize * rate)
    return byteSize(size).toString()
  }, [rate])

  return (
    <Typography
      color='gray'
      fontSize={13}
    >{filteredSize}</Typography>
  )
}

export default function LoggingConfigManager({
  config
}: {
  config: ConfigScheme
}) {
  const [updatedAt, setUpdatedAt] = useState(Date.now())
  const getTimestampFromDay = useCallback((lastDay: number) => {
    return updatedAt-(lastDay*1000*3600*24)
  }, [updatedAt])

  const getTimestampFromWeek = useCallback((lastWeek: number) => {
    return updatedAt-(lastWeek*1000*3600*24*7)
  }, [updatedAt])

  const pattern = '**/*.webp'
  const updateInterval = 1000 * 60 * 10 // 10m
  const bundles = [
    { olderThan: getTimestampFromDay(0), label: '전체' },
    { olderThan: getTimestampFromDay(1), label: '1일 전' },
    { olderThan: getTimestampFromDay(2), label: '2일 전' },
    { olderThan: getTimestampFromDay(3), label: '3일 전' },
    { olderThan: getTimestampFromWeek(1), label: '1주일 전' },
    { olderThan: getTimestampFromWeek(2), label: '2주일 전' },
    { olderThan: getTimestampFromWeek(3), label: '3주일 전' },
    { olderThan: getTimestampFromWeek(4), label: '한 달 전' },
  ]

  const [configOpen, setConfigOpen] = useState(false)
  const [allFiles, setAllFiles] = useState([])
  const [totalSize, setTotalSize] = useState(0)
  const distDirectory = useMemo(() => getLoggingDistDirectory(config.loggingDirectory), [config.loggingDirectory])

  const [confirmBundleIndex, setConfirmBundleIndex] = useState(-1)
  const confirmOpen   = useMemo(() => confirmBundleIndex !== -1, [confirmBundleIndex])
  const confirmTarget = useMemo(() => bundles[confirmBundleIndex], [confirmBundleIndex])

  async function fetchAllFiles() {
    const files = await ipc.fs.glob(pattern, { cwd: distDirectory, absolute: true })
    const size = await ipc.fs.getItemSize(files, true)
    setAllFiles(files)
    setTotalSize(Number(size))
  }

  async function handleRemoveSnapshots(lastTimestamp: number) {
    const filtered = allFiles.filter((t) => fileOlderThan(t, lastTimestamp))
    await ipc.fs.remove(filtered)
    setUpdatedAt(Date.now())
  }

  useEffect(() => {
    fetchAllFiles()
    const throttling = createThrottling()
    const cancel = throttling(() => setUpdatedAt(Date.now()), updateInterval)
    return cancel
  }, [distDirectory, updatedAt])

  return (
    <>
      <BlurDialog
        open={confirmOpen}
        onClose={() => setConfirmBundleIndex(-1)}
      >
        {
          confirmTarget && (
            <>
              <DialogTitle>{confirmTarget.label} 삭제</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  정말로 {confirmTarget.label} 기록을 삭제하시겠습니까?
                  <br />
                  이 작업은 되돌릴 수 없습니다.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  color='warning'
                  onClick={() => {
                    handleRemoveSnapshots(confirmTarget.olderThan)
                    setConfirmBundleIndex(-1)
                  }}
                >삭제하기</Button>
                <Button onClick={() => setConfirmBundleIndex(-1)}>취소</Button>
              </DialogActions>
            </>
          )
        }
      </BlurDialog>
      <BlurDialog
        open={configOpen}
        onClose={() => setConfigOpen(false)}
      >
        <DialogTitle>저장된 데이터 목록 관리</DialogTitle>
        <DialogContent>
          <DialogContentText>
            지정된 범위 이전의 스냅샷을 간단히 일괄 삭제할 수 있습니다.
            <br />
            이 작업은 되돌릴 수 없습니다.
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel id="demo-simple-select-label">삭제 범위 선택</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={confirmBundleIndex}
              label="삭제 범위 선택"
              onChange={(e) => setConfirmBundleIndex(e.target.value as number)}
            >
              {
                bundles.map((t, i) => (
                  <MenuItem key={t.label} value={i}>
                    <div>
                      <Typography>{t.label}</Typography>
                      <FileSizeOlderThan
                        allFiles={allFiles}
                        totalSize={totalSize}
                        olderThan={t.olderThan}
                      />
                    </div>
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </DialogContent>
      </BlurDialog>
      <Button
        size='small'
        onClick={() => setConfigOpen(true)}
      >사용량: {byteSize(totalSize).toString()}</Button>
    </>
  )
}
