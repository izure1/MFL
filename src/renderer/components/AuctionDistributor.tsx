import { useState, useEffect } from 'react'
import { 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Button, 
  Alert, 
  Card, 
  CardContent, 
  Typography, 
  Grid,
  Box
} from '@mui/material'

interface Item {
  id: number
  name: string
  quantity: number
  price: number
  cost: number
}

interface ResultItem {
  name: string
  quantity: number
  price: number
  totalPrice: number
  cost: number
  totalCost: number
  afterCommission: number
}

interface Result {
  validItems: ResultItem[]
  totalValue: number
  totalCostSum: number
  netProfit: number
  perPersonShare: number
  memberCount: number
  memberList: string[]
  sellerIndex: number
  commissionRate: number
}

export default function AuctionDistributor() {
  const [memberNames, setMemberNames] = useState('')
  const [commission, setCommission] = useState(4)
  const [sellerIndex, setSellerIndex] = useState(0)
  const [items, setItems] = useState<Item[]>([{ id: 1, name: '', quantity: 1, price: 0, cost: 0 }])
  const [results, setResults] = useState<Result|null>(null)
  const [nextItemId, setNextItemId] = useState(2)

  // 참여자 배열 추출
  const getMemberList = () => {
    return memberNames.split(',').map(s => s.trim()).filter(s => s !== '')
  }

  const memberList = getMemberList()
  const hasMembers = memberList.length > 0

  // 참여자가 변경될 때 판매자 인덱스 조정
  useEffect(() => {
    if (sellerIndex >= memberList.length && memberList.length > 0) {
      setSellerIndex(0)
    }
  }, [memberList.length, sellerIndex])

  const addItem = () => {
    setItems([...items, { id: nextItemId, name: '', quantity: 1, price: 0, cost: 0 }])
    setNextItemId(nextItemId + 1)
  }

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: number, field: string, value: string|number) => {
    setItems(items.map((item) => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + '원'
  }

  const calculate = () => {
    if (!hasMembers) {
      alert('참여자를 입력해주세요.')
      return
    }

    const memberCount = memberList.length
    const commissionRate = commission / 100

    // 아이템 데이터 수집
    const validItems: ResultItem[] = []
    let totalValue = 0
    let totalCostSum = 0

    items.forEach((item, index) => {
      const name = item.name || `아이템 ${index + 1}`
      const quantity = item.quantity || 1
      const price = item.price || 0
      const cost = item.cost || 0
      
      if (price > 0 && quantity > 0) {
        const totalPrice = price * quantity
        const totalCost = cost * quantity
        const afterCommission = totalPrice * (1 - commissionRate)
        validItems.push({ name, quantity, price, totalPrice, cost, totalCost, afterCommission })
        totalValue += afterCommission
        totalCostSum += totalCost
      }
    })

    if (validItems.length === 0) {
      alert('아이템을 추가해주세요.')
      return
    }

    // 계산 로직
    const netProfit = totalValue - totalCostSum
    const perPersonShare = netProfit / memberCount

    setResults({
      validItems,
      totalValue: totalValue - totalValue * commissionRate,
      totalCostSum,
      netProfit,
      perPersonShare,
      memberCount,
      memberList,
      sellerIndex,
      commissionRate
    })
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div>
        <Card>
          <CardContent>
            {/* 기본 설정 섹션 */}
            <Card className='mb-5 shadow-lg'>
              <CardContent className='p-6'>
                <Typography 
                  variant='h5' 
                  className='mb-5 pb-2' 
                  sx={{ 
                    color: '#444',
                    fontSize: '1.4rem',
                  }}
                >
                  기본 설정
                </Typography>
                
                <div className='w-full flex flex-row gap-4 items-end mb-5'>
                  <TextField
                    label='참여자 이름 (쉼표로 구분)'
                    value={memberNames}
                    onChange={(e) => setMemberNames(e.target.value)}
                    placeholder='예: 토리엘, 주덕배, 지금형이간다, 권련설화'
                    fullWidth
                    variant='outlined'
                    sx={{
                      flexShrink: 1,
                      flexGrow: 1,
                    }}
                  />
                  <TextField
                    label='수수료 (%)'
                    type='number'
                    value={commission}
                    onChange={(e) => setCommission(parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 50, step: 1 }}
                    sx={{
                      width: '150px',
                      flexGrow: 1,
                      flexShrink: 0,
                    }}
                  />
                </div>
                
                {hasMembers ? (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>판매자 선택</InputLabel>
                    <Select
                      value={sellerIndex}
                      label='판매자 선택'
                      onChange={(e) => setSellerIndex(parseInt(e.target.value as string))}
                      sx={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '10px',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                        },
                      }}
                    >
                      {memberList.map((name, index) => (
                        <MenuItem key={index} value={index}>
                          {name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Alert severity='warning' className='text-center'>
                    참여자를 입력하면 판매자를 선택할 수 있습니다.
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* 아이템 목록 섹션 */}
            <Card className='mb-5 shadow-lg' sx={{ borderRadius: '15px', border: '1px solid #e1e8ed' }}>
              <CardContent className='p-6'>
                <Typography 
                  variant='h5'
                  className='mb-5 pb-2' 
                  sx={{ 
                    color: '#444', 
                    borderBottom: '2px solid #667eea',
                    fontSize: '1.4rem'
                  }}
                >
                  아이템 목록
                </Typography>
                
                <div className='flex gap-4 mb-4 px-4 font-semibold text-gray-600'>
                  <div className='flex-[2]'>아이템 이름</div>
                  <div className='flex-[0.8]'>개수</div>
                  <div className='flex-1'>개당 가격</div>
                  <div className='flex-1'>개당 제작비용</div>
                  <div className='w-16'></div>
                </div>
                
                {items.map((item) => (
                  <Box key={item.id} className='flex gap-4 items-center bg-gray-50 p-4 rounded-lg mb-3 border border-gray-200'>
                    <TextField
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      placeholder='예: 무리아스의 성수'
                      variant='outlined'
                      size='small'
                      className='flex-[2]'
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f8f9fa',
                          borderRadius: '10px',
                        },
                      }}
                    />
                    <TextField
                      type='number'
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      placeholder='1'
                      variant='outlined'
                      size='small'
                      inputProps={{ min: 1 }}
                      className='flex-[0.8]'
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f8f9fa',
                          borderRadius: '10px',
                        },
                      }}
                    />
                    <TextField
                      type='number'
                      value={item.price}
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      placeholder='2700000'
                      variant='outlined'
                      size='small'
                      className='flex-1'
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f8f9fa',
                          borderRadius: '10px',
                        },
                      }}
                    />
                    <TextField
                      type='number'
                      value={item.cost}
                      onChange={(e) => updateItem(item.id, 'cost', parseFloat(e.target.value) || 0)}
                      placeholder='800000'
                      variant='outlined'
                      size='small'
                      className='flex-1'
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f8f9fa',
                          borderRadius: '10px',
                        },
                      }}
                    />
                    <Button
                      variant='contained'
                      color='error'
                      size='small'
                      onClick={() => removeItem(item.id)}
                      sx={{
                        borderRadius: '10px',
                        minWidth: 'auto',
                        px: 1.5,
                      }}
                    >
                      삭제
                    </Button>
                  </Box>
                ))}
                
                <Button
                  variant='contained'
                  onClick={addItem}
                  sx={{
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    borderRadius: '10px',
                    px: 3,
                    py: 1.5,
                    fontSize: '16px',
                    fontWeight: 600,
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                    },
                  }}
                >
                  + 아이템 추가
                </Button>
              </CardContent>
            </Card>

            {/* 계산 버튼 */}
            <Card className='mb-5 shadow-lg' sx={{ borderRadius: '15px', border: '1px solid #e1e8ed' }}>
              <CardContent className='p-6'>
                <Button
                  variant='contained'
                  onClick={calculate}
                  disabled={!hasMembers}
                  fullWidth
                  sx={{
                    py: 2,
                    fontSize: '18px',
                    fontWeight: 600,
                    borderRadius: '10px',
                    background: hasMembers ? 'linear-gradient(45deg, #667eea, #764ba2)' : '#ccc',
                    boxShadow: hasMembers ? '0 4px 15px rgba(102, 126, 234, 0.3)' : 'none',
                    '&:hover': hasMembers ? {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                    } : {},
                    '&:disabled': {
                      cursor: 'not-allowed',
                    },
                  }}
                >
                  💰 분배 계산하기
                </Button>
              </CardContent>
            </Card>

            {/* 결과 섹션 */}
            {results && (
              <Card 
                className='shadow-lg' 
                sx={{ 
                  borderRadius: '15px', 
                  border: '1px solid #e1e8ed',
                  borderLeft: '5px solid #667eea',
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                }}
              >
                <CardContent className='p-6'>
                  <Typography 
                    variant='h5' 
                    className='mb-5 pb-2' 
                    sx={{ 
                      color: '#444', 
                      borderBottom: '2px solid #667eea',
                      fontSize: '1.4rem'
                    }}
                  >
                    분배 결과
                  </Typography>
                  
                  <Grid container spacing={2} className='mt-4'>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card className='text-center shadow-sm' sx={{ borderRadius: '10px', border: '1px solid #e1e8ed' }}>
                        <CardContent>
                          <Typography variant='h4' className='font-bold mb-1' sx={{ color: '#667eea' }}>
                            {formatCurrency(results.totalValue)}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            총 판매 수익
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card className='text-center shadow-sm' sx={{ borderRadius: '10px', border: '1px solid #e1e8ed' }}>
                        <CardContent>
                          <Typography variant='h4' className='font-bold mb-1' sx={{ color: '#667eea' }}>
                            {formatCurrency(results.totalCostSum)}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            총 제작비용
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card className='text-center shadow-sm' sx={{ borderRadius: '10px', border: '1px solid #e1e8ed' }}>
                        <CardContent>
                          <Typography variant='h4' className='font-bold mb-1' sx={{ color: '#667eea' }}>
                            {formatCurrency(results.netProfit)}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            순 분배 금액
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card className='text-center shadow-sm' sx={{ borderRadius: '10px', border: '1px solid #e1e8ed' }}>
                        <CardContent>
                          <Typography variant='h4' className='font-bold mb-1' sx={{ color: '#667eea' }}>
                            {formatCurrency(results.perPersonShare)}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            1인당 분배액
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {results.netProfit < 0 && (
                    <Alert severity='warning' className='my-4'>
                      ⚠️ 주의: 제작비용이 판매 수익보다 많아 손실이 발생했습니다. 
                      판매자는 {formatCurrency(Math.abs(results.netProfit))}만큼 손해를 보게 됩니다.
                    </Alert>
                  )}

                  <Card className='mt-4' sx={{ borderRadius: '10px' }}>
                    <CardContent>
                      {/* 판매자 먼저 표시 */}
                      <Box 
                        className='p-4 mb-4 rounded-lg text-white'
                        sx={{ background: 'linear-gradient(45deg, #667eea, #764ba2)' }}
                      >
                        <div className='flex justify-between items-center pb-3 border-b border-white border-opacity-20'>
                          <Typography className='font-semibold'>
                            🏪 {results.memberList[results.sellerIndex]} (판매자)
                          </Typography>
                          <Typography variant='h5' className='font-bold'>
                            {formatCurrency(results.totalCostSum + results.perPersonShare)}
                          </Typography>
                        </div>
                        <Typography variant='body2' className='mt-2'>
                          제작비용 회수: {formatCurrency(results.totalCostSum)} + 분배액: {formatCurrency(results.perPersonShare)}
                        </Typography>
                      </Box>

                      {/* 다른 참여자들 */}
                      {results.memberList.map((name, index) => {
                        if (index === results.sellerIndex) return null
                        return (
                          <div key={index} className='flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0'>
                            <Typography className='font-semibold'>{name}</Typography>
                            <Typography variant='h5' className='font-bold text-green-600'>
                              {formatCurrency(results.perPersonShare)}
                            </Typography>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>

                  {/* 아이템 상세 내역 */}
                  <Typography variant='h6' className='mt-6 mb-4 text-gray-700'>
                    아이템 상세 내역
                  </Typography>
                  <Card sx={{ borderRadius: '10px' }}>
                    <CardContent>
                      {results.validItems.map((item, index) => {
                        const commissionAmount = item.totalPrice * results.commissionRate
                        return (
                          <div key={index} className='py-3 border-b border-gray-200 last:border-b-0'>
                            <Typography className='font-bold mb-1'>
                              {item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              {item.quantity > 1 ? `개당 가격: ${formatCurrency(item.price)} | 총 가격: ${formatCurrency(item.totalPrice)} | ` : `가격: ${formatCurrency(item.totalPrice)} | `}
                              수수료: {formatCurrency(commissionAmount)} |&nbsp;
                              {item.quantity > 1 ? `개당 제작비용: ${formatCurrency(item.cost)} | 총 제작비용: ${formatCurrency(item.totalCost)} | ` : `제작비용: ${formatCurrency(item.totalCost)} | `}
                              실수익: {formatCurrency(item.afterCommission)}
                            </Typography>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
