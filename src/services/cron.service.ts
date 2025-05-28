import { sequelize } from '../db'
import { randomUUID } from 'crypto'
import { QueryTypes } from 'sequelize'
import { ITaskBase, ITaskRan } from '../types/task.type'

const INSTANCE_ID = `${process.env.INSTANCE_ID ?? randomUUID()}`
console.log({ INSTANCE_ID })
const TASKS = [
  { name: 'taskA', interval_seconds: 300 },
  { name: 'taskB', interval_seconds: 330 },
  { name: 'taskC', interval_seconds: 360 },
  { name: 'taskD', interval_seconds: 390 },
  { name: 'taskE', interval_seconds: 420 },
]

async function initializeTasks() {
  for (const task of TASKS) {
    await sequelize.query(
      `INSERT INTO cron_tasks (name, interval_seconds)
       VALUES (:name, :interval)
       ON CONFLICT (name) DO NOTHING;`,
      {
        replacements: { name: task.name, interval: task.interval_seconds },
      },
    )
  }
}

async function tryLockTask(taskName: string): Promise<boolean> {
  return await sequelize.transaction(async (t) => {
    const [locks]: any[] = await sequelize.query(
      `
      SELECT i.id, COALESCE(COUNT(c.name), 0) AS task_count
      FROM instances i
      LEFT OUTER JOIN cron_tasks c ON i.id = c.locked_by
      GROUP BY i.id;
      `,
      { transaction: t },
    )

    const counts = Object.fromEntries(
      locks.map((r: any) => [r.id, parseInt(r.count)]),
    )

    const currentCount = counts[INSTANCE_ID] || 0
    const minCount = Math.min(...Object.values(counts), currentCount)

    if (currentCount > minCount) {
      return false
    }

    const [result] = await sequelize.query(
      `
      UPDATE cron_tasks
      SET locked_by = :instanceId,
          locked_at = NOW(),
          last_run_at = NOW()
      WHERE name = :taskName
        AND (
          locked_at IS NULL OR locked_at < NOW() - INTERVAL '5 minutes'
        )
        AND (
          last_run_at IS NULL OR last_run_at < NOW() - (interval_seconds || ' seconds')::INTERVAL
        )
      RETURNING *;
      `,
      {
        replacements: { taskName, instanceId: INSTANCE_ID },
        transaction: t,
      },
    )

    return Array.isArray(result) && result.length > 0
  })
}

async function releaseTask(taskName?: string): Promise<void> {
  const query = `
    UPDATE cron_tasks
    SET locked_by = NULL, locked_at = NULL
    WHERE locked_by = :instanceId
    ${taskName ? 'AND name = :taskName' : ''};
  `

  const replacements: Record<string, unknown> = { instanceId: INSTANCE_ID }
  if (taskName) {
    replacements.taskName = taskName
  }

  try {
    await sequelize.query(query, { replacements })
    console.log(
      taskName
        ? `Released task '${taskName}' locked by instance ${INSTANCE_ID}`
        : `Released all tasks locked by instance ${INSTANCE_ID}`,
    )
  } catch (err) {
    console.error('Failed to release task(s):', err)
  }
}

async function executeTask(taskName: string): Promise<void> {
  const [statusCheck] = await sequelize.query(
    `SELECT locked_by FROM cron_tasks WHERE name = :taskName`,
    {
      replacements: { taskName },
    },
  )

  const runningOn = (statusCheck as any)[0]?.locked_by
  if (runningOn !== INSTANCE_ID) return

  await sequelize.query(
    `INSERT INTO cron_history (task_name, started_at, instance_id, status)
     VALUES (:taskName, NOW(), :instanceId, 'started')`,
    {
      replacements: { taskName, instanceId: INSTANCE_ID },
    },
  )

  try {
    await new Promise((resolve) => setTimeout(resolve, 2 * 60 * 1000)) // 2+ мин

    await sequelize.query(
      `UPDATE cron_history
       SET finished_at = NOW(), status = 'success'
       WHERE task_name = :taskName AND instance_id = :instanceId AND finished_at IS NULL`,
      {
        replacements: { taskName, instanceId: INSTANCE_ID },
      },
    )
  } catch (err) {
    await sequelize.query(
      `UPDATE cron_history
       SET finished_at = NOW(), status = 'error', message = :msg
       WHERE task_name = :taskName AND instance_id = :instanceId AND finished_at IS NULL`,
      {
        replacements: {
          taskName,
          instanceId: INSTANCE_ID,
          msg: String(err),
        },
      },
    )
  } finally {
    await releaseTask(taskName)
  }
}

async function taskLoop(taskName: string): Promise<void> {
  setInterval(async () => {
    try {
      const locked = await tryLockTask(taskName)
      if (locked) {
        console.log(`[${INSTANCE_ID}] Executing: ${taskName}`)
        await executeTask(taskName)
      }
    } catch (err) {
      console.error(`[${INSTANCE_ID}] Task error: ${taskName}`, err)
    }
  }, 10_000)
}

export async function tasksStatus(): Promise<ITaskRan[]> {
  const [tasks] = await sequelize.query<ITaskBase[]>(
    `
    SELECT name, locked_by, locked_at, 
      EXTRACT(EPOCH FROM NOW() - locked_at)::INT AS running_seconds
    FROM cron_tasks
  `,
    {
      type: QueryTypes.SELECT,
    },
  )
  return tasks
}

async function startTasks() {
  for (const task of TASKS) {
    taskLoop(task.name)
  }
}

async function startHeartbeat(interval = 30_000): Promise<void> {
  await sequelize.query(
    `
    INSERT INTO instances (id, last_heartbeat)
    VALUES (:instanceId, NOW())
    ON CONFLICT (id) DO UPDATE
    SET last_heartbeat = EXCLUDED.last_heartbeat
    `,
    {
      replacements: { instanceId: INSTANCE_ID },
      type: QueryTypes.INSERT,
    },
  )

  setInterval(async () => {
    try {
      await sequelize.query(
        `
        UPDATE instances
        SET last_heartbeat = NOW()
        WHERE id = :instanceId
        `,
        {
          replacements: { instanceId: INSTANCE_ID },
          type: QueryTypes.UPDATE,
        },
      )
      console.log(`[heartbeat] Updated instance ${INSTANCE_ID}`)
    } catch (err) {
      console.error('[heartbeat] Error updating heartbeat:', err)
    }
  }, interval)
}

async function cleanDeadInstances(thresholdSeconds = 35) {
  await sequelize.query(
    `
    DELETE FROM instances
    WHERE last_heartbeat < NOW() - (:threshold * INTERVAL '1 second')
    RETURNING id
    `,
    {
      replacements: { threshold: thresholdSeconds },
      type: QueryTypes.DELETE,
    },
  )
}

startHeartbeat()
  .then(initializeTasks)
  .then(startTasks)
  .catch(() => {
    console.error('Failed to initialize task list')
  })

setInterval(() => cleanDeadInstances(35), 30_000)

function handleShutdown(signal: string) {
  console.log(`Received ${signal}, cleaning up...`)
  releaseTask().then(() => {
    process.exit(0)
  })
}

process.on('SIGINT', () => handleShutdown('SIGINT'))
process.on('SIGTERM', () => handleShutdown('SIGTERM'))
process.on('exit', () => {
  console.log('Process exiting, cleaning up tasks...')
  releaseTask()
})
