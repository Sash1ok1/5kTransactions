import express from 'express'
import transactionRoutes from './routes/transaction.route'
import cronRoute from './routes/cron.route'

export const createApp = () => {
  const app = express()
  app.use(express.json())
  app.use(transactionRoutes)
  app.use(cronRoute)
  return app
}
