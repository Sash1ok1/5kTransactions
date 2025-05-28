export interface ITaskBase {
    name: string
    locked_by: string | null
    locked_at: string | null
    running_seconds: number | null
}

export interface ITaskRan extends ITaskBase {
    name: string
    locked_by: string | null
    locked_at: string | null
    running_seconds: number | null
}
