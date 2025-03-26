import { css } from '@emotion/react'
import { Box, Grid, Typography } from '@mui/material'
import { forwardRef, useEffect, useMemo, useState } from 'react'
import { ipc } from '../../../renderer/ipc.js'

export interface TimerProps {
  reactionTime: number
}

function useDate() {
  const [now, setNow] = useState(new Date())
  const month = useMemo(() => now.getMonth() + 1, [now])
  const date = useMemo(() => now.getDate(), [now])
  const day = useMemo(() => now.getDay(), [now])
  const dayOfWeek = useMemo(() => ['일', '월', '화', '수', '목', '금', '토'][day], [day])
  const hours = useMemo(() => now.getHours(), [now])
  const minutes = useMemo(() => now.getMinutes(), [now])
  const meridiem = useMemo(() => hours >= 12 ? 'PM' : 'AM', [hours])

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return { month, date, dayOfWeek, hours, minutes, meridiem }
}

export default forwardRef<HTMLDivElement, TimerProps>(({
  reactionTime,
}, ref) => {
  const [isIdle, setIsIdle] = useState(false)
  const { month, date, dayOfWeek, hours, minutes, meridiem } = useDate()
  const textShadow = '1px 1px 0.5rem rgba(0, 0, 0, 0.5)'

  async function listenIdle() {
    return ipc.idle.add(reactionTime)
  }

  async function unListenIdle(id: string) {
    return ipc.idle.remove(id)
  }

  useEffect(() => {
    let id: string|undefined
    let onSleep: ReturnType<typeof ipc.idle.onSleep>|undefined
    let onAwake: ReturnType<typeof ipc.idle.onAwake>|undefined
    listenIdle().then((_id) => {
      id = _id
      onSleep = ipc.idle.onSleep(id, (_id, deltaTime) => setIsIdle(true))
      onAwake = ipc.idle.onAwake(id, (_id, deltaTime) => setIsIdle(false))
    })
    return () => {
      if (id) {
        unListenIdle(id).then(() => {
          ipc.idle.offAwake(onAwake)
          ipc.idle.offSleep(onSleep)
        })
      }
    }
  }, [])

  return (
    <div
      ref={ref}
      className={
        `transition-fade ${ isIdle ? 'show' : '' }`
      }
    >
      <Box
        fontFamily={'Mabinogi'}
        color={'rgb(230, 230, 230)'}
      >
        <Grid container justifyContent={'center'} alignItems={'end'}>
          <Grid item sx={{ mr: 2 }}>
            <Typography
              height={'8rem'}
              fontSize={'4rem'}
              lineHeight={'8rem'}
              sx={{
                'textShadow': textShadow
              }}
            >{meridiem}</Typography>
          </Grid>
          <Grid item>
            <Typography
              height={'8rem'}
              fontSize={'8rem'}
              lineHeight={'8rem'}
              sx={{
                'textShadow': textShadow
              }}
            >{
              hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')
            }</Typography>
          </Grid>
        </Grid>
        <hr css={css`
          height: 0.3rem;
          margin-top: -1rem;
          padding: 0 1rem;
          background-color: rgb(230, 230, 230);
          border: 0;
          border-radius: calc(1px / 0);
          box-shadow: ${textShadow};
        `} />
        <Grid container justifyContent={'center'} alignItems={'end'}>
          <Grid item sx={{ mr: 5 }}>
            <Typography
              height={'4rem'}
              fontSize={'3rem'}
              lineHeight={'4rem'}
              sx={{
                'textShadow': textShadow
              }}
            >{month}월 {date}일</Typography>
          </Grid>
          <Grid item>
            <Typography
              height={'4rem'}
              fontSize={'3rem'}
              padding={'0 1.5rem'}
              lineHeight={'4.2rem'}
              borderRadius={'1.5rem'}
              boxShadow={textShadow}
              sx={{
                'background': 'rgb(230, 230, 230) !important',
                'WebkitTextFillColor': 'transparent',
                'WebkitBackgroundClip': 'text',
                'backgroundClip': 'text',
              }}
            >
              {dayOfWeek}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </div>
  )
})
