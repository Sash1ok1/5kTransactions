import { Umzug, SequelizeStorage } from 'umzug'
import { sequelize } from './db'

export const umzug = new Umzug({
  migrations: {
    glob: ['dist/migrations/*.js', {}],
  },
  context: sequelize,
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
})
