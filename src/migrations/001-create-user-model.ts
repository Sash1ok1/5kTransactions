module.exports = {
  async up({ context: queryInterface }) {
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
  },

  async down({ context: queryInterface }) {
    await queryInterface.getQueryInterface().dropTable('users')
  },
}
