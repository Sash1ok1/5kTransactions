module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.getQueryInterface().createTable('instances', {
      id: {
        type: 'VARCHAR(255)',
        primaryKey: true,
      },
      last_heartbeat: {
        type: 'TIMESTAMP',
        allowNull: false,
      },
    })
  },

  async down({ context: queryInterface }) {
    await queryInterface.getQueryInterface().dropTable('instances')
  },
}
