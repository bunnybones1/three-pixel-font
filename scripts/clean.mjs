import { rm } from 'node:fs/promises'

await Promise.all([
  rm('lib', { force: true, recursive: true }),
  rm('types', { force: true, recursive: true }),
])
