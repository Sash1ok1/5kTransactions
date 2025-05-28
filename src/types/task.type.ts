export interface ITask {
  name: string
  interval_seconds: number
  last_run_at: Date | null
  locked_by: string | null
  locked_at: Date | null
  running_seconds: number
}

export interface IActiveTaskInfo {
  lockedAt: Date
  instanceId: string
  intervalSeconds: number
  runningSeconds: number
}

export interface IWaitingTaskInfo {
  lastRunAt: Date | null
  intervalSeconds: number
}

export interface ITasksStatusResult {
  active: Record<string, IActiveTaskInfo>
  wait: Record<string, IWaitingTaskInfo>
}
