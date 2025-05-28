import { Router, Request, Response } from 'express'
import { tasksStatus } from '../services/cron.service'

const router = Router()

router.get(
  '/tasks/status',
  async (_req: Request, res: Response): Promise<Response> => {
    try {
      const tasks = await tasksStatus()

      return res.json({ success: true, tasks })
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, message: (err as Error).message })
    }
  },
)

export default router
