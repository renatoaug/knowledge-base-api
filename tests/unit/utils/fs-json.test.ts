import { getDataDir, readJsonFile, writeJsonFile } from 'src/utils/fs-json'
import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import path from 'node:path'

describe('[unit] fs-json', () => {
  const tmp = path.resolve(process.cwd(), 'data-test-unit')
  const envBefore = process.env.DATA_DIR

  beforeAll(() => {
    process.env.DATA_DIR = tmp
    if (fsSync.existsSync(tmp)) fsSync.rmSync(tmp, { recursive: true, force: true })
  })

  afterAll(() => {
    process.env.DATA_DIR = envBefore
    if (fsSync.existsSync(tmp)) fsSync.rmSync(tmp, { recursive: true, force: true })
  })

  it('getDataDir respects DATA_DIR', () => {
    expect(getDataDir()).toBe(tmp)
  })

  it('readJsonFile returns fallback and creates file on ENOENT', async () => {
    const fallback = { hello: 'world' }
    const data = await readJsonFile('x.json', fallback)
    expect(data).toEqual(fallback)
    const fileContent = JSON.parse(await fs.readFile(path.join(tmp, 'x.json'), 'utf-8'))
    expect(fileContent).toEqual(fallback)
  })

  it('writeJsonFile writes pretty JSON', async () => {
    const payload = { ok: true }
    await writeJsonFile('y.json', payload)
    const raw = await fs.readFile(path.join(tmp, 'y.json'), 'utf-8')
    const parsed = JSON.parse(raw)
    expect(parsed).toEqual(payload)
    expect(raw.includes('\n')).toBe(true)
  })
})
