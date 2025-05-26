import { Router, Request, Response } from 'express'
import { debitBalance } from '../services/balance.service'
import { ExceptionEnum } from '../const/exception.enum'

const router = Router()

router.post(
  '/transaction',
  async (req: Request, res: Response): Promise<Response> => {
    const { userId, amount } = req.body
    if (typeof userId !== 'number') {
      return res.status(400).json({ error: ExceptionEnum.INVALID_USERID_INPUT })
    }

    if (typeof amount !== 'number') {
      return res.status(400).json({ error: ExceptionEnum.INVALID_AMOUNT_INPUT })
    }
    try {
      await debitBalance(userId, amount)
      return res.json({ success: true })
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, message: (err as Error).message })
    }
  },
)

export default router
