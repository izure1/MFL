import normalize from 'normalize-path'

export function getLoggingDistDirectory(root: string): string {
  return normalize(root + '/Snapshots log')
}
