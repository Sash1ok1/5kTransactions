import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../db'

export class CronHistory extends Model {}

CronHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    task_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    finished_at: {
      type: DataTypes.DATE,
    },
    instance_id: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: 'cron_history',
    tableName: 'cron_history',
    timestamps: false,
  },
)
