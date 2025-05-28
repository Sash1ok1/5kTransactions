import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../db'

export class CronTask extends Model {}

CronTask.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    interval_seconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    last_run_at: {
      type: DataTypes.DATE,
    },
    locked_by: {
      type: DataTypes.TEXT,
    },
    locked_at: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'cron_tasks',
    tableName: 'cron_tasks',
    timestamps: false,
  },
)
