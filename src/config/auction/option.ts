import { AuctionItem, AuctionItemOptionResolver } from '../../types/index.js'
import MabinogiCategory from './category.json'

function findMatched(item: AuctionItem, type: string, subType: string|null|undefined): AuctionItem['item_option'] {
  const options = item.item_option ?? []
  return options.filter((option) => {
    if (subType === undefined) {
      return option.option_type === type
    }
    return option.option_type === type && option.option_sub_type === subType
  })
}

/**
 * 토템 관련 데이터 정규화 함수
 * 마비노기 개발팀을 죽여버릴것이다
 * @param item 검색할 대상 아이템
 * @param subType 검색할 아이템 옵션 효과. '최대 생명력', '최대생명력' 두 종류로 나뉘어져있는 경우가 있음. 이 경우 배열로 둘 다 전달
 * @returns 
 */
function normalizeTotemStats(item: AuctionItem, subType: string|string[]) {
  const options = [
    ...findMatched(item, '토템 효과', undefined),
    ...findMatched(item, '토템 추가 옵션', undefined)
  ]
  if (!Array.isArray(subType)) {
    subType = [subType]
  }
  return options.reduce((acc, option) => {
    if (subType.includes(option.option_sub_type)) {
      const v = parseFloat(option.option_value)
      acc += v
    }
    return acc
  }, 0)
}

const MAX_NUMBER = 9999_9999_9999

export const AuctionItemOptionResolvers: AuctionItemOptionResolver[] = [
  {
    id: 'e0e4d163-b1bd-45e6-8c78-d74835724fc9',
    type: 'text',
    defaultValue: '',
    name: '아이템 이름 포함',
    category: '*',
    generator: (keyword: string) => (item: AuctionItem) => {
      return item.item_display_name.includes(keyword)
    }
  },
  {
    id: '3b283e4e-9f9c-4d00-8dd1-ae302318a1c3',
    type: 'text',
    defaultValue: '',
    name: '아이템 이름 제외',
    category: '*',
    generator: (keyword: string) => (item: AuctionItem) => {
      return !item.item_display_name.includes(keyword)
    }
  },
  {
    id: 'e8d1b303-abc6-4a87-ad85-b2524b4de881',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '아이템 개당 가격',
    category: '*',
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = item.auction_price_per_unit
      return v >= min && v <= max
    }
  },
  {
    id: 'eb96aaee-10b9-48a6-9a25-d51ee8492b9e',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '아이템 갯수',
    category: '*',
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = item.item_count
      return v >= min && v <= max
    }
  },
  {
    id: '5909d0f0-4bd1-40b1-8c0f-a387a7d5f6bc',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '최대 내구력',
    category: [
      ...MabinogiCategory['갑옷 장비'],
      ...MabinogiCategory['근거리 장비'],
      ...MabinogiCategory['원거리 장비'],
      ...MabinogiCategory['마법 장비'],
      ...MabinogiCategory['방어 장비'],
      ...MabinogiCategory['특수 장비'],
      ...MabinogiCategory['액세서리'],
      ...MabinogiCategory['설치물'],
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '내구력', null)
      return options.some((option) => {
        const v = parseFloat(option.option_value2)
        return v >= min && v <= max
      })
    }
  },
  {
    id: '0b7254f9-101c-4e58-9391-3e476b26570d',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '남은 사용 횟수',
    category: [
      '마기그래프 도안',
      '도면',
      '옷본',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '남은 사용 횟수', null)
      return options.some((option) => {
        const v = parseFloat(option.option_value)
        return v >= min && v <= max
      })
    }
  },
  {
    id: 'eef119c8-8b7f-4ed9-b893-d550614cc36b',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '최대 공격력',
    category: [
      ...MabinogiCategory['근거리 장비'],
      ...MabinogiCategory['원거리 장비'],
      ...MabinogiCategory['마법 장비'],
      ...MabinogiCategory['특수 장비'],
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '공격', null)
      return options.some((option) => {
        const v = parseFloat(option.option_value2)
        return v >= min && v <= max
      })
    }
  },
  {
    id: '06602280-6351-4c37-8bf0-94ffc9ef852d',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '최대 부상률',
    category: [
      ...MabinogiCategory['근거리 장비'],
      ...MabinogiCategory['원거리 장비'],
      ...MabinogiCategory['마법 장비'],
      ...MabinogiCategory['특수 장비'],
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '부상률', null)
      return options.some((option) => {
        const v = parseFloat(option.option_value2)
        return v >= min && v <= max
      })
    }
  },
  {
    id: 'b56ad3fe-646c-4836-b34f-65fc7a2a1362',
    type: 'range',
    defaultValue: [0, 100],
    name: '밸런스',
    category: [
      ...MabinogiCategory['근거리 장비'],
      ...MabinogiCategory['원거리 장비'],
      ...MabinogiCategory['마법 장비'],
      ...MabinogiCategory['특수 장비'],
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '밸런스', null)
      return options.some((option) => {
        const v = parseFloat(option.option_value)
        return v >= min && v <= max
      })
    }
  },
  {
    id: '47bf16e7-373b-455a-95a1-d23b2bce2027',
    type: 'range',
    defaultValue: [0, 100],
    name: '숙련도',
    category: [
      ...MabinogiCategory['근거리 장비'],
      ...MabinogiCategory['원거리 장비'],
      ...MabinogiCategory['마법 장비'],
      ...MabinogiCategory['갑옷 장비'],
      ...MabinogiCategory['특수 장비'],
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '숙련', null)
      return options.some((option) => {
        const v = parseFloat(option.option_value)
        return v >= min && v <= max
      })
    }
  },
  {
    id: '8a2589cd-f8ca-4e64-97bd-3f22c97bc22f',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '크리티컬',
    category: [
      ...MabinogiCategory['근거리 장비'],
      ...MabinogiCategory['원거리 장비'],
      ...MabinogiCategory['마법 장비'],
      ...MabinogiCategory['특수 장비'],
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '크리티컬', null)
      return options.some((option) => {
        const v = parseFloat(option.option_value)
        return v >= min && v <= max
      })
    }
  },
  {
    id: 'b3cf82a4-cd4b-45cb-a716-9ef04968cb74',
    type: 'range',
    defaultValue: [0, 7],
    name: '전용 해제 가능 횟수',
    category: [
      ...MabinogiCategory['근거리 장비'],
      ...MabinogiCategory['원거리 장비'],
      ...MabinogiCategory['마법 장비'],
      ...MabinogiCategory['갑옷 장비'],
      ...MabinogiCategory['액세서리'],
      ...MabinogiCategory['특수 장비'],
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '남은 전용 해제 가능 횟수', null)
      return options.some((option) => {
        const v = parseFloat(option.option_value)
        return v >= min && v <= max
      })
    }
  },
  {
    id: 'c9bd2372-6a07-4a79-8e49-33b9fb9ff417',
    type: 'multiple',
    defaultValue: ['', '0', '10'],
    placeholders: ['명칭', '최소', '최대'],
    name: '세트 효과',
    category: [
      ...MabinogiCategory['근거리 장비'],
      ...MabinogiCategory['원거리 장비'],
      ...MabinogiCategory['마법 장비'],
      ...MabinogiCategory['갑옷 장비'],
      ...MabinogiCategory['방어 장비'],
      ...MabinogiCategory['액세서리'],
      ...MabinogiCategory['특수 장비'],
    ],
    generator: (keyword: string, rawMin: string, rawMax: string) => (item: AuctionItem) => {
      const options = findMatched(item, '세트 효과', undefined)
      const min = parseFloat(rawMin)
      const max = parseFloat(rawMax)
      return options.some((option) => {
        if (!option.option_value.includes(keyword)) {
          return false
        }
        const v = parseFloat(option.option_value2)
        return v >= min && v <= max
      })
    }
  },
  {
    id: '81f608de-9ec7-42dd-869c-f26e2b0ba82b',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '피어싱 레벨',
    category: [
      ...MabinogiCategory['근거리 장비'],
      ...MabinogiCategory['원거리 장비'],
      ...MabinogiCategory['마법 장비'],
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '피어싱 레벨', null)
      return options.some((option) => {
        const v1 = parseFloat(option.option_value)
        const v2 = parseFloat(option.option_value2)
        const v = v1 + v2
        return v >= min && v <= max
      })
    }
  },
  {
    id: 'eaf2b922-9530-41bb-a8f3-c112a80acfb5',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '방어',
    category: [
      ...MabinogiCategory['갑옷 장비'],
      '마도서',
      '액세서리'
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '방어력', null)
      return options.some((option) => {
        const v = parseFloat(option.option_value)
        return v >= min && v <= max
      })
    }
  },
  {
    id: 'cde0efb0-b512-4ab9-8136-f5a27ca0bc48',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '보호',
    category: [
      ...MabinogiCategory['갑옷 장비'],
      '마도서',
      '액세서리',
      '오브'
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '보호', null)
      return options.some((option) => {
        const v = parseFloat(option.option_value)
        return v >= min && v <= max
      })
    }
  },
  {
    id: '11357703-a59e-4e5b-90f4-a5ae2c53bdc0',
    type: 'number',
    defaultValue: 0,
    labels: [
      {
        text: '없음',
        value: 0
      },
      {
        text: '3랭크',
        value: 3
      },
      {
        text: '2랭크',
        value: 2
      },
      {
        text: '1랭크',
        value: 1
      }
    ],
    name: '세공 랭크',
    category: [
      ...MabinogiCategory['근거리 장비'],
      ...MabinogiCategory['원거리 장비'],
      ...MabinogiCategory['마법 장비'],
      ...MabinogiCategory['갑옷 장비'],
      ...MabinogiCategory['방어 장비'],
      ...MabinogiCategory['액세서리'],
      ...MabinogiCategory['특수 장비'],
    ],
    generator: (value: number) => (item: AuctionItem) => {
      const options = findMatched(item, '세공 랭크', null)
      return options.some((option) => {
        const v = parseFloat(option.option_value)
        return value === v
      })
    }
  },
  {
    id: 'e530d408-1fec-4981-b48a-5c5b6efc3f88',
    type: 'number',
    defaultValue: 0,
    labels: [
      {
        text: '없음',
        value: 0
      },
      {
        text: '1개',
        value: 1
      },
      {
        text: '2개',
        value: 2
      },
      {
        text: '3개',
        value: 3
      }
    ],
    name: '세공 발현 수',
    category: [
      ...MabinogiCategory['근거리 장비'],
      ...MabinogiCategory['원거리 장비'],
      ...MabinogiCategory['마법 장비'],
      ...MabinogiCategory['갑옷 장비'],
      ...MabinogiCategory['방어 장비'],
      ...MabinogiCategory['액세서리'],
      ...MabinogiCategory['특수 장비'],
    ],
    generator: (value: number) => (item: AuctionItem) => {
      const options = findMatched(item, '세공 옵션', undefined)
      return value === options.length
    }
  },
  {
    id: 'a5f83bd5-4eb3-496a-92f4-d80deb4ece4a',
    type: 'multiple',
    defaultValue: ['', '0', '25'],
    placeholders: ['명칭', '최소', '최대'],
    name: '세공 옵션',
    category: [
      ...MabinogiCategory['근거리 장비'],
      ...MabinogiCategory['원거리 장비'],
      ...MabinogiCategory['마법 장비'],
      ...MabinogiCategory['갑옷 장비'],
      ...MabinogiCategory['방어 장비'],
      ...MabinogiCategory['액세서리'],
      ...MabinogiCategory['특수 장비'],
    ],
    generator: (keyword: string, rawMin: string, rawMax: string) => (item: AuctionItem) => {
      const options = findMatched(item, '세공 옵션', undefined)
      const min = parseFloat(rawMin)
      const max = parseFloat(rawMax)
      const reg = new RegExp(`.*${keyword}.*\\((\\d+)레벨:.*\\)$`, 'g')
      return options.some((option) => {
        const raw = option.option_value
        const matched = reg.exec(raw)
        if (!matched) {
          return false
        }
        const v = parseFloat(matched[1])
        return v >= min && v <= max
      })
    }
  },
  {
    id: 'd5824e63-992b-467b-aec1-441b0a6a65ab',
    type: 'range',
    defaultValue: [0, 7],
    name: '특별 개조 단계',
    category: [
      ...MabinogiCategory['근거리 장비'],
      ...MabinogiCategory['원거리 장비'],
      ...MabinogiCategory['마법 장비'],
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '특별 개조', undefined)
      return options.some((option) => {
        const v = parseFloat(option.option_value)
        return v >= min && v <= max
      })
    }
  },
  {
    id: '1131cfe4-113e-4735-9d19-00dffe73de70',
    type: 'text',
    defaultValue: 'S',
    labels: [
      {
        text: 'S',
        value: 'S'
      },
      {
        text: 'R',
        value: 'R'
      }
    ],
    name: '특별 개조 종류',
    category: [
      ...MabinogiCategory['근거리 장비'],
      ...MabinogiCategory['원거리 장비'],
      ...MabinogiCategory['마법 장비'],
    ],
    generator: (type: 'S'|'R') => (item: AuctionItem) => {
      const options = findMatched(item, '특별 개조', type)
      return !!options.length
    }
  },
  {
    id: 'fb915ed2-ce00-456a-9df1-85673c3a5956',
    type: 'text',
    defaultValue: '',
    name: '인챈트(접두)',
    category: [
      ...MabinogiCategory['근거리 장비'],
      ...MabinogiCategory['원거리 장비'],
      ...MabinogiCategory['마법 장비'],
      ...MabinogiCategory['갑옷 장비'],
      ...MabinogiCategory['방어 장비'],
      ...MabinogiCategory['액세서리'],
      ...MabinogiCategory['특수 장비'],
    ],
    generator: (keyword: string) => (item: AuctionItem) => {
      const options = findMatched(item, '인챈트', '접두')
      return options.some((option) => {
        const v = option.option_value
        return v.includes(keyword)
      })
    }
  },
  {
    id: 'b486cedc-220b-40e9-ba2b-fd29f68e3e4f',
    type: 'text',
    defaultValue: '',
    name: '인챈트(접미)',
    category: [
      ...MabinogiCategory['근거리 장비'],
      ...MabinogiCategory['원거리 장비'],
      ...MabinogiCategory['마법 장비'],
      ...MabinogiCategory['갑옷 장비'],
      ...MabinogiCategory['방어 장비'],
      ...MabinogiCategory['액세서리'],
      ...MabinogiCategory['특수 장비'],
    ],
    generator: (keyword: string) => (item: AuctionItem) => {
      const options = findMatched(item, '인챈트', '접미')
      return options.some((option) => {
        const v = option.option_value
        return v.includes(keyword)
      })
    }
  },
  {
    id: '88f6c57d-6834-431a-be45-b71b6945b3a8',
    type: 'multiple',
    defaultValue: ['', '', '0', MAX_NUMBER.toString()],
    placeholders: ['인챈트 명칭', '옵션 명칭', '최소', '최대'],
    name: '인챈트 상세 옵션',
    category: [
      ...MabinogiCategory['근거리 장비'],
      ...MabinogiCategory['원거리 장비'],
      ...MabinogiCategory['마법 장비'],
      ...MabinogiCategory['갑옷 장비'],
      ...MabinogiCategory['방어 장비'],
      ...MabinogiCategory['액세서리'],
      ...MabinogiCategory['특수 장비'],
    ],
    generator: (
      enchantKeyword: string,
      optionKeyword: string,
      rawMin: string,
      rawMax: string
    ) => (item: AuctionItem) => {
      const options = findMatched(item, '인챈트', undefined)
      const min = parseFloat(rawMin)
      const max = parseFloat(rawMax)
      const reg = new RegExp(`.*${optionKeyword}.* (\\d+) (증가|감소).*?`)
      return options.some((option) => {
        if (!option.option_value.includes(enchantKeyword)) {
          return false
        }
        const descriptions = (option.option_desc ?? '').split(',')
        return descriptions.some((description) => {
          const matched = reg.exec(description)
          if (!matched) {
            return false
          }
          const v = parseFloat(matched[1])
          return v >= min && v <= max
        })
      })
    }
  },
  {
    id: '557b7022-9250-4e78-a7b3-c0f761421fd5',
    type: 'range',
    defaultValue: [0, 50],
    name: '에르그 레벨',
    category: [
      ...MabinogiCategory['근거리 장비'],
      ...MabinogiCategory['원거리 장비'],
      ...MabinogiCategory['마법 장비'],
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '에르그', undefined)
      return options.some((option) => {
        const v = parseFloat(option.option_value)
        return v >= min && v <= max
      })
    }
  },
  {
    id: 'cd770d9e-dffa-401d-a1b5-956fdf7df89e',
    type: 'text',
    defaultValue: 'S',
    labels: [
      {
        text: 'S',
        value: 'S'
      },
      {
        text: 'A',
        value: 'A'
      },
      {
        text: 'B',
        value: 'B'
      }
    ],
    name: '에르그 등급',
    category: [
      ...MabinogiCategory['근거리 장비'],
      ...MabinogiCategory['원거리 장비'],
      ...MabinogiCategory['마법 장비'],
    ],
    generator: (type: 'S'|'A'|'B') => (item: AuctionItem) => {
      const options = findMatched(item, '에르그', type)
      return !!options.length
    }
  },
  {
    id: 'e91b9f39-2062-4332-b8a0-d79c5a77d159',
    type: 'number',
    defaultValue: 1,
    labels: [
      {
        text: '불가능',
        value: 0
      },
      {
        text: '가능',
        value: 1
      }
    ],
    name: '인챈트 가능',
    category: [
      ...MabinogiCategory['근거리 장비'],
      ...MabinogiCategory['원거리 장비'],
      ...MabinogiCategory['마법 장비'],
      ...MabinogiCategory['갑옷 장비'],
      ...MabinogiCategory['방어 장비'],
      ...MabinogiCategory['액세서리'],
      ...MabinogiCategory['특수 장비'],
    ],
    generator: (able: number) => (item: AuctionItem) => {
      const options = findMatched(item, '인챈트 불가능', null)
      if (!options.length) {
        return able === 1
      }
      return options.some((option) => {
        const v = option.option_value
        return Boolean(able).toString() !== v
      })
    }
  },
  {
    id: 'b6bc655e-16c6-457b-889c-5fc446175d23',
    type: 'range',
    defaultValue: [0, 5],
    name: '남은 분양 횟수',
    category: [
      '분양 메달',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '펫 정보', '남은 분양 횟수')
      return options.some((option) => {
        const v = parseFloat(option.option_value)
        return v >= min && v <= max
      })
    }
  },
  {
    id: 'f0ac0bc1-ca91-4974-a1de-63ac799a936f',
    type: 'text',
    defaultValue: '',
    name: '펫 종족명',
    category: [
      '분양 메달',
    ],
    generator: (keyword: string) => (item: AuctionItem) => {
      const options = findMatched(item, '인챈트', '종족명')
      return options.some((option) => {
        const v = option.option_value
        return v.includes(keyword)
      })
    }
  },
  {
    id: 'f8d7c4e5-b85f-45b2-99bd-6e698bee38ab',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '펫 누적레벨',
    category: [
      '분양 메달',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '펫 정보', '누적 레벨')
      return options.some((option) => {
        const v = parseFloat(option.option_value)
        return v >= min && v <= max
      })
    }
  },
  {
    id: '1c5b33bb-25ae-4c4a-845f-7f61bf49d175',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '펫 포인트',
    category: [
      '분양 메달',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '펫 정보', '펫 포인트')
      return options.some((option) => {
        const v = parseFloat(option.option_value)
        return v >= min && v <= max
      })
    }
  },
  {
    id: '59c157cc-b8f7-4436-86ef-a36d72e2a5ce',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '최대 마나',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '최대 마나')
      return v >= min && v <= max
    }
  },
  {
    id: '798a71d0-5a3f-4dc7-b8d6-417c2682d4ca',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '밸런스',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '밸런스')
      return v >= min && v <= max
    }
  },
  {
    id: 'bffafdcb-fce6-405d-9740-72c9995f474e',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '크리티컬',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '크리티컬')
      return v >= min && v <= max
    }
  },
  {
    id: '5052bdc0-4464-4d35-9ec5-ee5a88d5c133',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '최대 대미지',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, ['최대 대미지', '최대대미지'])
      return v >= min && v <= max
    }
  },
  {
    id: '1949962d-004c-4322-a7c6-dd6ad1d693da',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '최대 생명력',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, ['최대 생명력', '최대생명력'])
      return v >= min && v <= max
    }
  },
  {
    id: '09aa3624-0689-4c03-a608-89dcc3e987fe',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '최대 스태미나',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, ['최대 스태미나', '최대스태미나'])
      return v >= min && v <= max
    }
  },
  {
    id: 'fafa80fa-88a6-46fd-9422-c0c2b9438a07',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '체력',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '체력')
      return v >= min && v <= max
    }
  },
  {
    id: 'e9f7cc1d-9161-456c-a631-a80bd0f21858',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '솜씨',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '솜씨')
      return v >= min && v <= max
    }
  },
  {
    id: '23f8c356-9e2a-413a-8078-3f7f909c7342',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '의지',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '의지')
      return v >= min && v <= max
    }
  },
  {
    id: '8006b719-08ba-40e7-8443-0290b8c183bb',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '행운',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '행운')
      return v >= min && v <= max
    }
  },
  {
    id: 'ce3a4c30-81b3-4e61-b5e9-a283ec9b302c',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '보호',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '보호')
      return v >= min && v <= max
    }
  },
  {
    id: 'da6dcb39-7b1a-440e-932f-0115dff35143',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '방어',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '방어')
      return v >= min && v <= max
    }
  },
  {
    id: 'c02830d3-d8ee-448c-9133-084defd66193',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '마법 방어',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, ['마법 방어', '마법 방어력'])
      return v >= min && v <= max
    }
  },
  {
    id: 'c220caca-4656-4242-8f3d-55fb9c77b25a',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '마법 보호',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, ['마법 보호', '마법 보호력']) // 혹시 모름
      return v >= min && v <= max
    }
  },
  {
    id: 'cd574bdb-f959-4d2e-ab04-5dae71d4cb21',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '마법 공격력',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, ['마법 공격', '마법 공격력']) // 혹시 모름
      return v >= min && v <= max
    }
  },
  {
    id: 'b5f97ab0-391d-41e3-a954-f4a5d120b836',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '지력',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '지력')
      return v >= min && v <= max
    }
  },
  {
    id: '0eb57db3-dfc7-4819-9b3b-237ced6542be',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '최소 대미지',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, ['최소 대미지', '최소대미지'])
      return v >= min && v <= max
    }
  },
  {
    id: 'f898f17f-ba75-4774-baf8-22c7e63f4944',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '물 속성 연금술 대미지',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '물 속성 연금술 대미지')
      return v >= min && v <= max
    }
  },
  {
    id: 'bf13d689-6d69-4f96-b96a-820a097952d8',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '불 속성 연금술 대미지',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '불 속성 연금술 대미지')
      return v >= min && v <= max
    }
  },
  {
    id: 'ba6a9f3a-2dd0-4b40-a0d0-563d02b3cbb3',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '바람 속성 연금술 대미지',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '바람 속성 연금술 대미지')
      return v >= min && v <= max
    }
  },
  {
    id: '67cbb5a3-9710-4475-97d0-311069ed3f29',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '흙 속성 연금술 대미지',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '흙 속성 연금술 대미지')
      return v >= min && v <= max
    }
  },
  {
    id: '8cccced0-e393-49c8-bf0a-bc6fdeae7d7a',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '마리오네트 보호',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '마리오네트 보호')
      return v >= min && v <= max
    }
  },
  {
    id: '00486f30-07ad-44cd-8ecf-fdf88e555a9b',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '마리오네트 방어',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '마리오네트 방어')
      return v >= min && v <= max
    }
  },
  {
    id: 'd932a967-95cb-4634-a867-4861288c59b3',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '마리오네트 최대 대미지',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '마리오네트 최대 대미지')
      return v >= min && v <= max
    }
  },
  {
    id: 'ca8bee76-fec4-424f-8422-bdd548243383',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '마리오네트 최소 대미지',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '마리오네트 최소 대미지')
      return v >= min && v <= max
    }
  },
  {
    id: 'c2a4413b-4a95-4aba-b14f-4ceb567dab31',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '듀얼건 최대 대미지',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '듀얼건 최대 대미지')
      return v >= min && v <= max
    }
  },
  {
    id: '78b08649-b501-43de-9892-d8617e06768e',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '듀얼건 최소 대미지',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '듀얼건 최소 대미지')
      return v >= min && v <= max
    }
  },
  {
    id: 'a0cfa21f-71af-4599-a6a2-ac6756fe3cde',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '최대 부상률',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '최대 부상률')
      return v >= min && v <= max
    }
  },
  {
    id: '5c6c096a-e225-466b-be44-6d9d453323a5',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '최소 부상률',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '최소 부상률')
      return v >= min && v <= max
    }
  },
  {
    id: '71f20c8b-7b72-4f01-b6dc-ff6052300ded',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '음악 버프 스킬 지속시간',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '음악 버프 스킬 지속시간')
      return v >= min && v <= max
    }
  },
  {
    id: '69d2e2b4-dc64-47f1-956a-e651e8591e91',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '수리검 최대 대미지',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '수리검 최대 대미지')
      return v >= min && v <= max
    }
  },
  {
    id: 'cc0b2335-0522-4266-8ef8-bdb67cf91a85',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '수리검 최소 대미지',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '수리검 최소 대미지')
      return v >= min && v <= max
    }
  },
  {
    id: 'b51751e7-203d-495b-b0b2-36f5e986c63e',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '체인 블레이드 최대 대미지',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '체인 블레이드 최대 대미지')
      return v >= min && v <= max
    }
  },
  {
    id: 'af1568bd-555d-4dda-be1c-5afcc124ce47',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '체인 블레이드 최소 대미지',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '체인 블레이드 최소 대미지')
      return v >= min && v <= max
    }
  },
  {
    id: '2d1a40db-ef9b-43b0-b694-c6f5ccab6208',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '너클 최대 대미지',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '너클 최대 대미지')
      return v >= min && v <= max
    }
  },
  {
    id: '29e31618-35fc-4254-9226-69785fa2534e',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '너클 최소 대미지',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '너클 최소 대미지')
      return v >= min && v <= max
    }
  },
  {
    id: '03844b75-58f1-4e12-8be5-8b22e02c4487',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '근접 재능 무기 최대 대미지',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '근접 재능 무기 최대 대미지')
      return v >= min && v <= max
    }
  },
  {
    id: '7e8cf2f1-6e95-4d46-aca2-f75b5022bff2',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '근접 재능 무기 최소 대미지',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '근접 재능 무기 최소 대미지')
      return v >= min && v <= max
    }
  },
  {
    id: '1c169bab-9877-4ff3-9468-fdc1a964a020',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '궁술 재능 무기 최대 대미지',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '궁술 재능 무기 최대 대미지')
      return v >= min && v <= max
    }
  },
  {
    id: '3930caa6-1874-48cf-afd9-fe414d7e80fc',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '궁술 재능 무기 최소 대미지',
    category: [
      '토템',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const v = normalizeTotemStats(item, '궁술 재능 무기 최소 대미지')
      return v >= min && v <= max
    }
  },
  {
    id: '3c48230f-f170-4ad1-bd44-8a55ad2d6dbe',
    type: 'multiple',
    defaultValue: ['', '0', MAX_NUMBER.toString()],
    placeholders: ['명칭', '최소', '최대'],
    name: '음식 옵션',
    category: [
      '음식',
    ],
    generator: (keyword: string, rawMin: string, rawMax: string) => (item: AuctionItem) => {
      const options = findMatched(item, '사용 효과', undefined)
      return options.some((option) => {
        const min = parseFloat(rawMin)
        const max = parseFloat(rawMax)
        const reg = new RegExp(`.*${keyword}.* (\\d+) `, 'g')
        const raw = option.option_value
        const matched = reg.exec(raw)
        if (!matched) {
          return false
        }
        const v = parseFloat(matched[1])
        return v >= min && v <= max
      })
    }
  },
  {
    id: 'a2d2af67-f46e-4bb6-8214-f9781b07a62d',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '크기',
    category: [
      '보석',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '크기', null)
      return options.some((option) => {
        const v = parseFloat(option.option_value)
        return v >= min && v <= max
      })
    }
  },
  {
    id: '80fb071d-05ae-4eed-8b75-73dc347df564',
    type: 'range',
    defaultValue: [0, 255],
    name: '색상 코드(R)',
    category: [
      '염색 앰플',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '색상', null)
      return options.some((option) => {
        const [r, g, b] = option.option_value.split(',')[0]
        const v = parseFloat(r)
        return v >= min && v <= max
      })
    }
  },
  {
    id: '7e6e9e22-e47e-4566-ab14-4cb4b8fc8932',
    type: 'range',
    defaultValue: [0, 255],
    name: '색상 코드(G)',
    category: [
      '염색 앰플',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '색상', null)
      return options.some((option) => {
        const [r, g, b] = option.option_value.split(',')[0]
        const v = parseFloat(g)
        return v >= min && v <= max
      })
    }
  },
  {
    id: '7315c8a3-b673-40cf-9f15-879e5a39f868',
    type: 'range',
    defaultValue: [0, 255],
    name: '색상 코드(B)',
    category: [
      '염색 앰플',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '색상', null)
      return options.some((option) => {
        const [r, g, b] = option.option_value.split(',')[0]
        const v = parseFloat(b)
        return v >= min && v <= max
      })
    }
  },
  {
    id: '89020454-291b-4c7f-8f2d-4a27741c55ee',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '내구도',
    category: [
      '인챈트 스크롤',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '내구도', null)
      return options.some((option) => {
        const v = parseFloat(option.option_value)
        return v >= min && v <= max
      })
    }
  },
  {
    id: '3fccd331-bdaa-47b1-a253-dfc4d415090c',
    type: 'range',
    defaultValue: [0, 30],
    name: '에코스톤 등급',
    category: [
      '에코스톤',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '에코스톤 등급', null)
      return options.some((option) => {
        const v = parseFloat(option.option_value)
        return v >= min && v <= max
      })
    }
  },
  {
    id: 'ad928c28-cbd9-49f7-8570-3f5c20e8dd62',
    type: 'text',
    defaultValue: '생명력',
    name: '에코스톤 고유 능력',
    category: [
      '에코스톤',
    ],
    generator: (keyword: string) => (item: AuctionItem) => {
      const options = findMatched(item, '에코스톤 고유 능력', undefined)
      return options.some((option) => {
        return option.option_sub_type.includes(keyword)
      })
    }
  },
  {
    id: '5650c70d-fd7f-4cef-984a-51ec70391a40',
    type: 'range',
    defaultValue: [0, MAX_NUMBER],
    name: '에코스톤 고유 능력 수치',
    category: [
      '에코스톤',
    ],
    generator: (min: number, max: number) => (item: AuctionItem) => {
      const options = findMatched(item, '에코스톤 고유 능력', undefined)
      return options.some((option) => {
        const v = parseFloat(option.option_value)
        return v >= min && v <= max
      })
    }
  },
  {
    id: 'b78a00f9-e706-41f3-893a-63e6f371d322',
    type: 'multiple',
    defaultValue: ['', '0', '20'],
    placeholders: ['명칭', '최소', '최대'],
    name: '에코스톤 각성 능력',
    category: [
      '에코스톤',
    ],
    generator: (keyword: string, rawMin: string, rawMax: string) => (item: AuctionItem) => {
      const options = findMatched(item, '에코스톤 각성 능력', undefined)
      const min = parseFloat(rawMin)
      const max = parseFloat(rawMax)
      const reg = new RegExp(`.*${keyword}.* (\\d+) 레벨$`, 'g')
      return options.some((option) => {
        const raw = option.option_value
        const matched = reg.exec(raw)
        if (!matched) {
          return false
        }
        const v = parseFloat(matched[1])
        return v >= min && v <= max
      })
    }
  },
]
