import { promises as fs } from 'node:fs'
import fsSync from 'node:fs'
import path from 'node:path'

export function getDataDir(): string {
  return process.env.DATA_DIR || path.resolve(process.cwd(), 'data')
}

export function ensureDataDir(): void {
  const dir = getDataDir()
  if (!fsSync.existsSync(dir)) {
    fsSync.mkdirSync(dir, { recursive: true })
  }
}

export async function readJsonFile<T>(fileName: string, fallback: T): Promise<T> {
  ensureDataDir()
  const filePath = path.join(getDataDir(), fileName)
  try {
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data) as T
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'ENOENT') {
      await writeJsonFile(fileName, fallback)
      return fallback
    }
    throw err
  }
}

export async function writeJsonFile<T>(fileName: string, data: T): Promise<void> {
  ensureDataDir()
  const filePath = path.join(getDataDir(), fileName)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}
