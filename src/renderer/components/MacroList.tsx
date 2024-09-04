import { MacroSchemeMap } from '../../types'
import { useMemo, useState } from 'react'
import { css } from '@emotion/react'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import DeleteForeverOutlined from '@mui/icons-material/DeleteForeverOutlined'
import MacroDrop from './MacroDrop'
import MacroEditor from './MacroEditor'

export default function MacroList({
  schemeMap
}: {
  schemeMap: MacroSchemeMap
}) {
  const [editTarget, setEditTarget] = useState<string|null>(null)
  const [dropTarget, setDropTarget] = useState<string|null>(null)
  const schemeNames = useMemo(
    () => Object.keys(schemeMap).sort((a, b) => a.localeCompare(b)),
    [schemeMap]
  )

  return (
    <>
      <List dense>
        {schemeNames.length ? (
          schemeNames.map((name) => (
            <ListItem
              key={name}
              onClick={() => setEditTarget(name)}
              secondaryAction={
                <IconButton onClick={(e) => {
                  e.stopPropagation()
                  setDropTarget(name)
                }}>
                  <DeleteForeverOutlined />
                </IconButton>
              }
              disablePadding
            >
              <ListItemButton disableRipple>
                <ListItemText>{name}</ListItemText>
              </ListItemButton>
            </ListItem>
          ))
        ) : (
          <div
            css={css`
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px 0;
          `}>
            <Typography
              color='grayText'
              fontSize={15}
            >상단에 추가 버튼을 눌러 새로운 매크로를 만드세요</Typography>
          </div>
        )}
      </List>
      <MacroDrop target={dropTarget} setTarget={setDropTarget} />
      <MacroEditor target={editTarget} setTarget={setEditTarget} />
    </>
  )
}
