module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.getQueryInterface().createTable('cron_tasks', {
      id: {
        type: 'SERIAL',
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: 'TEXT',
        allowNull: false,
        unique: true,
      },
      interval_seconds: {
        type: 'INTEGER',
        allowNull: false,
      },
      last_run_at: {
        type: 'TIMESTAMPTZ',
      },
      locked_by: {
        type: 'TEXT',
      },
      locked_at: {
        type: 'TIMESTAMPTZ',
      },
    })

    await queryInterface.getQueryInterface().createTable('cron_history', {
      id: {
        type: 'SERIAL',
        primaryKey: true,
        allowNull: false,
      },
      task_name: {
        type: 'TEXT',
        allowNull: false,
      },
      started_at: {
        type: 'TIMESTAMPTZ',
        allowNull: false,
      },
      finished_at: {
        type: 'TIMESTAMPTZ',
      },
      instance_id: {
        type: 'TEXT',
        allowNull: false,
      },
      status: {
        type: 'TEXT',
        allowNull: false,
      },
      message: {
        type: 'TEXT',
      },
    })
  },

  async down({ context: queryInterface }) {
    await queryInterface.getQueryInterface().dropTable('cron_history')
    await queryInterface.getQueryInterface().dropTable('cron_tasks')
  },
}
