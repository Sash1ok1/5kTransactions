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
