import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Select, TextField, Typography } from '@mui/material'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { AuctionWatchContext } from '../AuctionWatchProvider.js'
import { AuctionItemOptionResolvers } from '../../../config/auction/option.js'
import { optionResolvers } from '../../../helpers/auction.js'
import { AuctionItemWatchScheme } from '../../../types/index.js'
import { createUUIDV4 } from '../../../utils/id.js'
import { humanizeNumber } from '../../../utils/format.js'

function findResolver(id: string) {
  const resolver = optionResolvers.get(id)
  if (!resolver) {
    throw new Error(`'${id}' is Not existing resolver id.`)
  }
  return resolver
}

function AuctionItemOptionBox({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <Box
      alignContent='center'
      display='flex'
      columnGap={1}
      marginTop={1}
    >
      {children}
    </Box>
  )
}

function AuctionItemOptionSelector({
  item,
  itemOption,
  label,
  onChange,
  onRemove,
  children
}: {
  item: AuctionItemWatchScheme
  itemOption: AuctionItemWatchScheme['itemOptions'][0]
  label: React.ReactNode
  onChange: (id: string) => void
  onRemove: () => void
  children: React.ReactNode
}) {
  const resolver = findResolver(itemOption.resolver_id)
  const useableOptions = AuctionItemOptionResolvers.filter((r) => {
    return r.category === '*' || r.category.includes(item.itemCategory)
  })

  return (
    <Box marginY={3}>
      <fieldset>
        <legend>
          <Box
            display='flex'
            flexDirection='row'
            alignContent='center'
          >
            <Typography>{label}</Typography>
            <Button
              size='small'
              color='error'
              onClick={onRemove}
              sx={{ mx: 1, py: 0 }}
            >제거</Button>
          </Box>
        </legend>
        <div>
          <Select
            value={resolver.id}
            onChange={(e) => onChange(e.target.value)}
            size='small'
            fullWidth
          >
            {
              useableOptions.map((r, i) => (
                <MenuItem key={i} value={r.id}>
                  <Typography>{r.name}</Typography>
                </MenuItem>
              ))
            }
          </Select>
        </div>
        <div>{children}</div>
      </fieldset>
    </Box>
  ) 
}

function AuctionItemOptionInput({
  itemOption,
  onChange
}: {
  itemOption: AuctionItemWatchScheme['itemOptions'][0]
  onChange: (value: string|number|[number, number]|string[]) => void
}) {
  const resolver = findResolver(itemOption.resolver_id)

  function getPlaceholder(index: number, defaultText: string): string {
    const placeholders = resolver.placeholders ?? []
    return placeholders[index] ?? defaultText
  }

  function handleTextChange(raw: string) {
    if (raw === '') {
      raw = resolver.defaultValue as string
    }
    const v = raw
    onChange(v)
  }

  function handleNumberChange(raw: string) {
    if (raw === '') {
      raw = resolver.defaultValue.toString()
    }
    const v = Number(raw) || 0
    onChange(v)
  }

  function handleRangeChange(raw: string, index: number) {
    if (raw === '') {
      raw = (resolver.defaultValue as [number, number])[index].toString()
    }
    const v = Number(raw) || 0
    const clone = structuredClone(itemOption.value as [number, number])
    clone[index] = v
    onChange(clone)
  }

  function handleMultipleChange(raw: string, index: number) {
    if (raw === '') {
      raw = (resolver.defaultValue as string[])[index]
    }
    const v = raw
    const clone = structuredClone(itemOption.value as string[])
    clone[index] = v
    onChange(clone)
  }

  function createInputWithLabels(
    handle: typeof handleTextChange|typeof handleNumberChange,
    stringify: (raw: unknown) => string
  ) {
    return (
      <AuctionItemOptionBox>
        <Select
          value={stringify(itemOption.value)}
          onChange={(e) => handle(e.target.value)}
          size='small'
          fullWidth
        >
          {
            resolver.labels.map((label, i) => (
              <MenuItem
                key={i}
                value={stringify(label.value)}
              >
                <Typography>{label.text}</Typography>
              </MenuItem>
            ))
          }
        </Select>
      </AuctionItemOptionBox>
    )
  }

  function createTextInput() {
    const value = itemOption.value as string
    return (
      <AuctionItemOptionBox>
        <TextField
          type='text'
          size='small'
          placeholder={getPlaceholder(0, '명칭')}
          defaultValue={value}
          fullWidth
          onChange={(e) => handleTextChange(e.target.value)}
        />
      </AuctionItemOptionBox>
    )
  }

  function createNumberInput() {
    const value = itemOption.value as number
    const [helperNumber, setHelperNumber] = useState(value)
    const helperText = useMemo(() => humanizeNumber(helperNumber), [helperNumber])
    return (
      <AuctionItemOptionBox>
        <TextField
          type='number'
          size='small'
          placeholder={getPlaceholder(0, '값')}
          defaultValue={value}
          helperText={helperText}
          fullWidth
          onChange={(e) => {
            const raw = e.target.value
            const value = Number(raw)
            handleNumberChange(raw)
            setHelperNumber(value)
          }}
        />
      </AuctionItemOptionBox>
    )
  }

  function createRangeInput() {
    const value = itemOption.value as [number, number]
    const [helperNumber1, setHelperNumber1] = useState(value[0])
    const [helperNumber2, setHelperNumber2] = useState(value[1])
    const helperText1 = useMemo(() => humanizeNumber(helperNumber1), [helperNumber1])
    const helperText2 = useMemo(() => humanizeNumber(helperNumber2), [helperNumber2])
    return (
      <AuctionItemOptionBox>
        <TextField
          type='number'
          size='small'
          placeholder={getPlaceholder(0, '최소')}
          defaultValue={value[0].toString()}
          helperText={helperText1}
          fullWidth
          onChange={(e) => {
            const raw = e.target.value
            const value = Number(raw)
            handleRangeChange(raw, 0)
            setHelperNumber1(value)
          }}
        />
        <TextField
          type='number'
          size='small'
          placeholder={getPlaceholder(1, '최대')}
          defaultValue={value[1].toString()}
          helperText={helperText2}
          fullWidth
          onChange={(e) => {
            const raw = e.target.value
            const value = Number(raw)
            handleRangeChange(e.target.value, 1)
            setHelperNumber2(value)
          }}
        />
      </AuctionItemOptionBox>
    )
  }

  function createMultipleInput() {
    const value = itemOption.value as string[]
    return (
      <AuctionItemOptionBox>
        {
          value.map((v, i) => (
            <TextField
              key={i}
              type='text'
              size='small'
              placeholder={getPlaceholder(i, '')}
              defaultValue={v}
              fullWidth
              onChange={(e) => handleMultipleChange(e.target.value, i)}
            />
          ))
        }
      </AuctionItemOptionBox>
    )
  }

  switch (resolver.type) {
    case 'number': return resolver.labels ?
      createInputWithLabels(handleNumberChange, (v) => v.toString()) :
      createNumberInput()

    case 'range': return createRangeInput()

    case 'multiple': return createMultipleInput()

    case 'text': return resolver.labels ?
      createInputWithLabels(handleTextChange, (v) => v.toString()) :
      createTextInput()
  }
}

export default function AuctionWatchEditor({
  data,
  open,
  onClose
}: {
  data: AuctionItemWatchScheme
  open: boolean
  onClose: () => void
}) {
  const [clone, setClone] = useState(structuredClone(data))
  const { setCategory, setWatchData, setWatchEditorOpen } = useContext(AuctionWatchContext)

  function existsOption(option: AuctionItemWatchScheme['itemOptions'][0]) {
    return optionResolvers.has(option.resolver_id)
  }

  function handleDone() {
    setWatchData(clone)
    setWatchEditorOpen(false)
    setCategory(clone.itemCategory)
  }

  function handleAddOption() {
    const newClone = structuredClone(clone)
    const defaultItemOption = AuctionItemOptionResolvers[0]
    const itemOption: AuctionItemWatchScheme['itemOptions'][0] = {
      id: createUUIDV4(),
      resolver_id: defaultItemOption.id,
      value: structuredClone(defaultItemOption.defaultValue),
    }
    newClone.itemOptions.push(itemOption)
    setClone(newClone)
  }

  function handleChangeSelect(optionIndex: number, afterOptionId: string) {
    const newClone = structuredClone(clone)
    const itemOption = newClone.itemOptions[optionIndex]
    const resolver = findResolver(afterOptionId)
    itemOption.resolver_id = resolver.id
    itemOption.value = structuredClone(resolver.defaultValue)
    setClone(newClone)
  }
  
  function handleChangeInput(optionIndex: number, value: string|number|[number, number]|string[]) {
    const newClone = structuredClone(clone)
    const itemOption = newClone.itemOptions[optionIndex]
    itemOption.value = structuredClone(value)
    setClone(newClone)
  }

  function handleRemoveOption(index: number) {
    const newClone = structuredClone(clone)
    newClone.itemOptions.splice(index, 1)
    setClone(newClone)
  }

  useEffect(() => {
    setClone(structuredClone(data))
  }, [data, open])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
    >
      <DialogTitle>검색 옵션</DialogTitle>
      <DialogContent>
        <DialogContentText>상세 검색 옵션을 입력하세요. 모든 조건이 일치한 매물이 검색됩니다.</DialogContentText>
        {
          clone && clone.itemOptions.filter(existsOption).map((itemOption, i) => (
            <AuctionItemOptionSelector
              key={itemOption.id}
              item={clone}
              itemOption={itemOption}
              label={`검색 옵션 ${i+1}`}
              onChange={(id) => handleChangeSelect(i, id)}
              onRemove={() => handleRemoveOption(i)}
            >
              <AuctionItemOptionInput
                itemOption={itemOption}
                onChange={(value) => handleChangeInput(i, value)}
              />
            </AuctionItemOptionSelector>
          ))
        }
      </DialogContent>
      <DialogActions>
        <Box
          width='100%'
          display='flex'
          flexDirection='column'
        >
          <Button fullWidth onClick={handleAddOption}>검색 옵션 추가</Button>
          <Button fullWidth onClick={handleDone}>완료</Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}
