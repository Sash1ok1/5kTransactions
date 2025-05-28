import { sequelize } from '../db'
import { IUserBalance } from '../types/user.type'
import { withRetry } from '../utils/with-retry'
import { ExceptionEnum } from '../const/exception.enum'

async function debitBalanceInternal(
  userId: number,
  amount: number,
): Promise<IUserBalance> {
  const [result] = await sequelize.query(
    `
      UPDATE users
      SET balance = balance - :amount
      WHERE id = :userId
        AND balance >= :amount
      RETURNING balance;
      `,
    {
      replacements: { userId, amount },
    },
  )
  if (!result || result?.length === 0) {
    throw new Error(ExceptionEnum.INSUFFICIENT_FUNDS_OR_USER_NOT_FOUND)
  }
  return result[0] as IUserBalance
}

export const debitBalance = withRetry(debitBalanceInternal, 5, 200)
