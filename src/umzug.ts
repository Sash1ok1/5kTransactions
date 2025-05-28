import { Umzug, SequelizeStorage } from 'umzug'
import { sequelize } from './db'

export const umzug = new Umzug({
  migrations: {
    glob: ['src/migrations/*.js', {}],
  },
  context: sequelize,
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
})
