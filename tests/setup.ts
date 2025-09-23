import os from 'node:os'
import path from 'node:path'
import { promises as fs } from 'node:fs'
import { seedUsers } from 'tests/seed'

let tmpDataDir: string | null = null

beforeAll(async () => {
  const prefix = path.join(os.tmpdir(), 'kb-api-tests-')
  tmpDataDir = await fs.mkdtemp(prefix)
  process.env.DATA_DIR = tmpDataDir

  await seedUsers()
})

afterAll(async () => {
  if (tmpDataDir) {
    await fs.rm(tmpDataDir, { recursive: true, force: true })
    tmpDataDir = null
  }
})
