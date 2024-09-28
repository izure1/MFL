import type { ConfigScheme } from '../../types/index.js'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material'
import { DeleteForeverOutlined } from '@mui/icons-material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { basename } from 'path-browserify'
import { getLoggingDistDirectory } from '../../helpers/logger.js'
import { createThrottling } from '../../utils/timer.js'
import { ipc } from '../ipc.js'
import FileSizeSuspense from './FileSizeSuspense.js'

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
  cwd,
  olderThan,
  updatedAt
}: {
  cwd: string
  olderThan: number
  updatedAt: number
}) {
  const olderThanFilter = useCallback((itemPath: string) => {
    return fileOlderThan(itemPath, olderThan)
  }, [cwd, olderThan])

  return (
    <FileSizeSuspense
      pattern='**/*.webp'
      option={{ cwd, onlyFiles: true }}
      filter={olderThanFilter}
      updatedAt={updatedAt}
    />
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
  const distDirectory = useMemo(() => getLoggingDistDirectory(config.loggingDirectory), [config.loggingDirectory])

  const [confirmBundleIndex, setConfirmBundleIndex] = useState(-1)

  const confirmOpen   = useMemo(() => confirmBundleIndex !== -1, [confirmBundleIndex])
  const confirmTarget = useMemo(() => bundles[confirmBundleIndex], [confirmBundleIndex])

  const noneFilter = useCallback(() => true, [distDirectory])

  function getTimestamp(lastWeek: number) {
    return updatedAt-(lastWeek*1000*3600*24*7)
  }

  async function handleRemoveSnapshots(lastTimestamp: number) {
    const list = await ipc.fs.glob(pattern, { cwd: distDirectory, absolute: true })
    const filtered = list.filter((itemPath) => fileOlderThan(itemPath, lastTimestamp))
    await ipc.fs.remove(filtered)
    setUpdatedAt(Date.now())
  }

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
                        cwd={distDirectory}
                        olderThan={getTimestamp(t.week)}
                        updatedAt={updatedAt}
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
      >사용량: {(<FileSizeSuspense
          pattern={pattern}
          option={{ cwd: distDirectory }}
          filter={noneFilter}
          updatedAt={updatedAt}
        />
      )}</Button>
    </>
  )
}
