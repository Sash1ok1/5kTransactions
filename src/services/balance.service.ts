import { sequelize } from '../db'
import { Transaction } from 'sequelize'
import { UserBalance } from '../types/user.type'
import { withRetry } from '../utils/with-retry'
import { ExceptionEnum } from '../const/exception.enum'

async function debitBalanceInternal(
  userId: number,
  amount: number,
): Promise<UserBalance> {
  const transaction = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
  })

  try {
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
        transaction,
      },
    )
    if (!result || result?.length === 0) {
      throw new Error(ExceptionEnum.INSUFFICIENT_FUNDS_OR_USER_NOT_FOUND)
    }

    await transaction.commit()

    return result[0] as UserBalance
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

export const debitBalance = withRetry(debitBalanceInternal, 5, 200)
