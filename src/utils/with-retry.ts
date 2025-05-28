export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  retries = 5,
  delay = 200,
): (...args: Parameters<T>) => ReturnType<T> {
  return async function retryWrapper(
    ...args: Parameters<T>
  ): Promise<ReturnType<T>> {
    let attempt = 0
    while (attempt < retries) {
      try {
        return await fn(...args)
      } catch (err) {
        if (!isRetryableSequelizeError(err)) {
          throw err
        }
        attempt++
        if (attempt >= retries) {
          throw err
        }
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    throw new Error('Unreachable code reached in retry logic') // Чтобы удовлетворить TypeScript
  } as (...args: Parameters<T>) => ReturnType<T>
}

function isRetryableSequelizeError(error: any): boolean {
  const retryablePostgresCodes = [
    '40001', // serialization_failure
    '40P01', // deadlock_detected
    '53300', // too_many_connections
    '57014', // query_canceled
    '57P03', // cannot_connect_now
    '55P03', // lock_not_available
  ]
  const pgCode = error?.original?.code
  return retryablePostgresCodes.includes(pgCode)
}
