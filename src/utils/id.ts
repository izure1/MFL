export function createUUIDV4(): string {
  return globalThis.crypto.randomUUID()
}
