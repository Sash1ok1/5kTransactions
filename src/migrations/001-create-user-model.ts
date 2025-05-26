import { Sequelize } from 'sequelize'

export const up = async ({
  context: queryInterface,
}: {
  context: Sequelize
}) => {
  await queryInterface.getQueryInterface().createTable('users', {
    id: {
      type: 'INTEGER',
      primaryKey: true,
      autoIncrement: true,
    },
    balance: {
      type: 'INTEGER',
      allowNull: false,
      defaultValue: 10000,
    },
  })

  await queryInterface
    .getQueryInterface()
    .bulkInsert('users', [{ balance: 10000 }])
}

export const down = async ({
  context: queryInterface,
}: {
  context: Sequelize
}) => {
  await queryInterface.getQueryInterface().dropTable('users')
}
