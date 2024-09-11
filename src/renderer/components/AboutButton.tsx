import { useState } from 'react'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import Typography from '@mui/material/Typography'
import { ipc } from '../ipc'


const SpecUser = styled.span`
  font-size: 1rem;
  font-family: 'Mabinogi';
  color: rgb(225, 173, 145);
`

interface UserBoard {
  title: string
  users: string[]
}

export default function AboutButton() {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)

  function handle() {
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
    setCount(0)
  }

  function handleCount() {
    setCount(count+1)
    if (count > 7) {
      ipc.app.devtool()
      alert('개발자 모드 오픈!')
      setCount(0)
    }
  }

  const boards: UserBoard[][] = [
    [
      {
        title: '만든 사람',
        users: ['아리시에로']
      },
      {
        title: '테스터',
        users: ['궐련설화', '지금형이간다']
      },
    ],
    [
      {
        title: '제작 중 염탐한 사람',
        users: ['궐련설화']
      }
    ],
  ]

  return (
    <>
      <Button
        variant='text'
        size='large'
        disableElevation
        onClick={handle}
        sx={{
          fontFamily: 'Mabinogi'
        }}
      >정보</Button>

      <Dialog
        open={open}
        onClose={handleClose}
        onClick={handleCount}
        fullWidth
        sx={{
          backdropFilter: 'blur(9px)',
          '& .MuiDialog-paper': {
            backgroundImage: 'none',
            backgroundColor: 'rgb(24, 24, 26)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>류트 41채 카브 항구 연합 길드 제공</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <hr css={css`
              height: 1px;
              border: 0;
              background: linear-gradient(90deg, transparent, rgb(225, 173, 145), transparent);
            `} />
            <div css={css`
              color: 'white';
            `}>
              <div css={css`
                display: grid;
                grid-template-columns: repeat(2, 1fr);
              `}>
                {
                  boards.map((board, i) => (
                    <div key={`board-${i}`}>
                      {
                        board.map((section, j) => (
                          <dl
                            key={`board-${i}-section-${j}`}
                            css={css`
                              & > dt {
                                font-size: 1.25rem;
                                font-family: 'Mabinogi';
                                color: gray;
                                margin-top: 10px;
                              }
                              & > dd {
                                margin-top: 3px;
                                margin-left: 5px;
                              }
                            `}
                          >
                            <dt>{section.title}</dt>
                            <dd>
                              <SpecUser>{section.users.join(', ')}</SpecUser>
                            </dd>
                          </dl>
                        ))
                      }
                    </div>
                  ))
                }
              </div>
            </div>
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  )
}
