import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()
const { DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_DATABASE_NAME } =
  process.env

const DATABASE_URL = `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE_NAME}`

export const sequelize = new Sequelize(DATABASE_URL!, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 1000,
    min: 100,
    idle: 10000,
  },
})
