export type { OpenDialogOptions, OpenDialogReturnValue } from 'electron'
export type { Options as GlobOptions } from 'fast-glob'
export type { IdleFunction, IdleWatch } from '../helpers/idleWatcher.js'

import { UiohookKeyboardEvent, UiohookMouseEvent, UiohookWheelEvent } from 'uiohook-napi'
import type { KlafDocumentable } from 'klaf.js'

export interface IProcess {
  pid: number
  name: string
}

export interface ConfigScheme extends KlafDocumentable {
  limit: number
  running: boolean
  macroRunning: boolean
  logging: boolean
  loggingInterval: number
  loggingDirectory: string
  apiKey: string
  auctionWatching: boolean
  cursorRunning: boolean
  cursorThickness: number
  cursorSize: number
  cursorColor: string
  cursorCrosshair: boolean
  clockActivate: boolean
}

export interface AuctionItem extends KlafDocumentable {
  item_name: string
  item_display_name: string
  item_count: number
  auction_price_per_unit: number
  date_auction_expire: string
  item_option: {
    option_type: string
    option_sub_type: string|null
    option_value: string
    option_value2: string|null
    option_desc: string|null
  }[]|null
}

export interface AuctionItemScheme extends AuctionItem {
  id: string
  item_category: string
}

export enum AuctionWantedItemInspectStage {
  Pending,
  Alerted,
  Inspected,
}

export interface AuctionWantedItemScheme extends AuctionItemScheme {
  watch_id: string
  inspect: AuctionWantedItemInspectStage
}

export type AuctionWantedItemTuple = [AuctionItemWatchScheme, AuctionWantedItemScheme[]]

export interface AuctionItemWatchScheme extends KlafDocumentable {
  id: string
  itemCategory: string
  itemOptions: {
    id: string
    resolver_id: string
    value: string|number|[number, number]|string[]
  }[]
}

export interface AuctionResponse {
  auction_item?: AuctionItemScheme[]
  error?: {
    name: string
    message: string
  }
  next_cursor: string
}

export interface AuctionItemOptionType {
  option_sub_type: string|null
  option_value: string|null
  option_value2: string|null
  option_desc: string|null
}

export type BooleanConfigKeys<T extends ConfigScheme = ConfigScheme> = {
  [K in keyof T]: T[K] extends boolean ? K : never
}[keyof T]

interface AuctionItemOptionDefaultResolver {
  id: string
  name: string
  type: 'text'|'number'|'range'|'multiple'
  defaultValue: string|number|[number, number]|string[]
  labels?: {
    text: string
    value: string|number|[number, number]|string[]
  }[]
  placeholders?: string[]
  category: '*'|string[]
  generator: (
    ...arg: this['defaultValue'] extends (infer U)[] ?
    U[] :
    this['defaultValue'][]
  ) => (item: AuctionItem) => boolean
}

export interface AuctionItemOptionTextResolver extends AuctionItemOptionDefaultResolver {
  type: 'text'
  defaultValue: string
  labels?: {
    text: string
    value: string
  }[]
}

export interface AuctionItemOptionNumericResolver extends AuctionItemOptionDefaultResolver {
  type: 'number'
  defaultValue: number
  labels?: {
    text: string
    value: number
  }[]
}

export interface AuctionItemOptionRangeResolver extends AuctionItemOptionDefaultResolver {
  type: 'range'
  defaultValue: [number, number]
  labels?: {
    text: string
    value: [number, number]
  }[]
}

export interface AuctionItemOptionMultipleResolver extends AuctionItemOptionDefaultResolver {
  type: 'multiple'
  defaultValue: string[]
  labels?: {
    text: string
    value: string[]
  }[]
}

export type AuctionItemOptionResolver = 
  AuctionItemOptionTextResolver|
  AuctionItemOptionNumericResolver|
  AuctionItemOptionRangeResolver|
  AuctionItemOptionMultipleResolver

export interface MacroUnitScheme extends Record<string, string|number> {
  id: string
  hardware: 'keyboard'|'mouse'|'delay'
}

export interface MacroIOUnit extends MacroUnitScheme {
  hardware: 'keyboard'|'mouse'
  toggle: 'down'|'up'
  button: number
}

export interface MacroDelayUnit extends MacroUnitScheme {
  hardware: 'delay'
  duration: number
}

export type MacroUnit = MacroIOUnit|MacroDelayUnit

export interface MacroScheme extends KlafDocumentable {
  name: string
  trigger: MacroIOUnit
  type: 'once'|'while'|'repeat'
  units: MacroUnit[]
}

export type MacroSchemeMap = Record<string, MacroScheme>

export type IOKeyboardEvent = {
  type: 'keyboard'
  original: UiohookKeyboardEvent
}

export type IOMouseEvent = {
  type: 'mouse'
  original: UiohookMouseEvent
}

export type IOWheelEvent = {
  type: 'wheel'
  original: UiohookWheelEvent
}

export type IOEvent = IOKeyboardEvent|IOMouseEvent|IOWheelEvent