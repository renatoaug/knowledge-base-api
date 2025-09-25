import dotenv from 'dotenv'
import app from './app'

dotenv.config({ path: '.env', quiet: true })

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000
app.listen(PORT, () => {
  console.info(`[server] listening on port ${PORT}`)
})
