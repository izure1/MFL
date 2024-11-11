export function parse(rgba: string) {
  const rgbaRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/

  // 각각의 rgba 값 추출
  let [r, g, b, a=1] = rgba.match(rgbaRegex).map(Number).filter((t) => !!t)

  // 새로운 rgba 색상 문자열 반환
  return { r, g, b, a }
}
