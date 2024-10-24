import { Builder } from 'xml2js'

const builder = new Builder({ headless: true })

export function createXMLString(jsonData: any): string {
  return builder.buildObject(jsonData)
}
