import type { ConfigScheme } from '../../types/index.js'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material'
import { DeleteForeverOutlined } from '@mui/icons-material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { basename } from 'path-browserify'
import _byteSize from 'byte-size'
import { getLoggingDistDirectory } from '../../helpers/logger.js'
import { createThrottling } from '../../utils/timer.js'
import { ipc } from '../ipc.js'


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

  const filteredSize = useMemo(() => {
    const percentage = filteredFiles.length / allFiles.length
    const size = Math.ceil(totalSize * percentage)
    return byteSize(size).toString()
  }, [filteredFiles])

  return (
    <span>
      <Typography component='span'>{filteredSize}</Typography>
    </span>
  )
}

export default function LoggingConfigManager({
  config
}: {
  config: ConfigScheme
}) {
  const pattern = '**/*.webp'
  const updateInterval = 1000 * 60 * 10 // 10m
  const bundles = [
    { week: 0, label: '전체' },
    { week: 1, label: '1주일 전' },
    { week: 2, label: '2주일 전' },
    { week: 3, label: '3주일 전' },
    { week: 4, label: '한 달 전' },
  ]

  const [configOpen, setConfigOpen] = useState(false)
  const [updatedAt, setUpdatedAt] = useState(Date.now())
  const [allFiles, setAllFiles] = useState([])
  const [totalSize, setTotalSize] = useState(0)
  const distDirectory = useMemo(() => getLoggingDistDirectory(config.loggingDirectory), [config.loggingDirectory])

  const [confirmBundleIndex, setConfirmBundleIndex] = useState(-1)
  const confirmOpen   = useMemo(() => confirmBundleIndex !== -1, [confirmBundleIndex])
  const confirmTarget = useMemo(() => bundles[confirmBundleIndex], [confirmBundleIndex])

  const noneFilter = useCallback(() => true, [distDirectory])

  function getTimestamp(lastWeek: number) {
    return updatedAt-(lastWeek*1000*3600*24*7)
  }

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
  }, [distDirectory])

  useEffect(() => {
    const throttling = createThrottling()
    const cancel = throttling(() => setUpdatedAt(Date.now()), updateInterval)
    return cancel
  }, [distDirectory, updatedAt])

  return (
    <>
      <Dialog
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
                    handleRemoveSnapshots(getTimestamp(confirmTarget.week))
                    setConfirmBundleIndex(-1)
                  }}
                >삭제하기</Button>
                <Button onClick={() => setConfirmBundleIndex(-1)}>취소</Button>
              </DialogActions>
            </>
          )
        }
      </Dialog>
      <Dialog
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
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <List
            dense
            sx={{ width: '100%', maxWidth: 300 }}
          >
            {
              bundles.map((t, i) => (
                <ListItem
                  key={t.label}
                  secondaryAction={(
                    <IconButton
                      size='small'
                      onClick={() => setConfirmBundleIndex(i)}
                    >
                      <DeleteForeverOutlined />
                    </IconButton>
                  )}
                >
                  <ListItemText
                    primary={t.label}
                    secondary={(
                      <FileSizeOlderThan
                        allFiles={allFiles}
                        totalSize={totalSize}
                        olderThan={getTimestamp(t.week)}
                      />
                    )}
                  />
                </ListItem>
              ))
            }
          </List>
        </DialogActions>
      </Dialog>
      <Button
        size='small'
        onClick={() => setConfigOpen(true)}
      >사용량: {byteSize(totalSize).toString()}</Button>
    </>
  )
}
