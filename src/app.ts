import express from 'express'
import transactionRoutes from './routes/transaction.route'

export const createApp = () => {
  const app = express()
  app.use(express.json())
  app.use(transactionRoutes)
  return app
}
