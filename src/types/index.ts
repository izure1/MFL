export type { OpenDialogOptions, OpenDialogReturnValue } from 'electron'
export type { Options as GlobOptions } from 'fast-glob'
import { UiohookKeyboardEvent, UiohookMouseEvent, UiohookWheelEvent } from 'uiohook-napi'

export interface IProcess {
  pid: number
  name: string
}

export interface ConfigScheme {
  limit: number
  running: boolean
  logging: boolean
  loggingInterval: number
  loggingDirectory: string
}

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

export interface MacroScheme {
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