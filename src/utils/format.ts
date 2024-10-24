export function humanizeNumber(amount: number): string {
  const units = ['', '만', '억', '조', '경', '해']
  
  // 0원 처리
  if (amount === 0) return '0'
  
  // 숫자를 문자열로 변환
  let numStr = amount.toString()
  
  // 4자리씩 끊어서 배열로 만들기
  const chunks: string[] = []
  while (numStr.length > 0) {
    chunks.unshift(numStr.slice(-4))
    numStr = numStr.slice(0, -4)
  }
  
  let result = ''
  
  chunks.forEach((chunk, index) => {
    const num = parseInt(chunk)
    if (num !== 0) {
      // 1000 이하의 숫자는 그대로 표시
      result += num.toString()
      
      // 해당 단위 추가
      const unit = units[chunks.length - 1 - index]
      result += unit + ' '
    }
  })
  
  return result.trim() + ' '
}
