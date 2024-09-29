import { useEffect, useState } from 'react'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { Button, Dialog, DialogContent, DialogContentText,  DialogTitle } from '@mui/material'
import { ipc } from '../ipc.js'


const SpecUser = styled.span`
  font-size: 1rem;
  font-family: 'Mabinogi';
  color: rgb(225, 173, 145);
`

interface UserWithExternal {
  text: string
  url: string
}

interface UserBoard {
  title: string
  users: (string|UserWithExternal)[]
}

export default function AboutButton() {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const [version, setVersion] = useState('')

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

  function handleOpenExternal(url: string) {
    ipc.external.open(url)
  }

  async function fetchVersion() {
    const version = await ipc.app.version()
    setVersion(`v${version}`)
  }

  useEffect(() => {
    fetchVersion()
  }, [])

  const boards: UserBoard[][] = [
    [
      {
        title: '제공',
        users: ['(류트, 41채널) 카브 항구 연합 길드']
      },
      {
        title: '만든 사람',
        users: ['아리시에로']
      },
      {
        title: '테스터',
        users: ['권련설화', '지금형이간다']
      },
      {
        title: '제작 중 염탐한 사람',
        users: ['권련설화']
      }
    ],
    [
      {
        title: '다운로드',
        users: [
          {
            text: 'https://github.com/izure1/MFL',
            url: 'https://github.com/izure1/MFL'
          }
        ]
      },
      {
        title: '개발자 홈페이지',
        users: [
          {
            text: 'https://izure.org',
            url: 'https://izure.org'
          }
        ]
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
        <DialogTitle sx={{ pb: 1 }}>마탕화면 도우미 {version}</DialogTitle>
        <DialogContent>
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
                            {(
                              section.users.map((user, i, users) => {
                                if (typeof user === 'string') return (
                                  <SpecUser key={i}>
                                    {user}{i+1 === users.length ? '' : ', '}
                                  </SpecUser>
                                )
                                return (
                                  <SpecUser
                                    key={i}
                                    css={css`
                                      cursor: pointer;
                                    `}
                                    onClick={() => handleOpenExternal(user.url)}
                                  >
                                    {user.text}
                                  </SpecUser>
                                )
                              })
                            )}
                          </dd>
                        </dl>
                      ))
                    }
                  </div>
                ))
              }
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
