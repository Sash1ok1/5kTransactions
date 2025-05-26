import { sequelize } from './db'
import { umzug } from './umzug'
import { createApp } from './app'
import dotenv from 'dotenv'

dotenv.config()

const start = async () => {
  try {
    await sequelize.authenticate()
    await umzug.up()

    const app = createApp()
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`)
    })
  } catch (error) {
    console.error('Error during startup:', error)
  }
}

start()
