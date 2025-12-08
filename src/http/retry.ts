export interface RetryOptions {
  attempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean | Promise<boolean>;
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const calculateBackoffDelay = (
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number,
): number => {
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 1000; // random jitter to avoid thundering herd
  return Math.min(exponentialDelay + jitter, maxDelayMs);
};

export const withRetry = async <T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptions = {},
): Promise<T> => {
  const attempts = options.attempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 1000;
  const maxDelayMs = options.maxDelayMs ?? 30000;
  const shouldRetry = options.shouldRetry ?? (() => true);

  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      const hasAttemptsRemaining = attempt < attempts - 1;
      const retryAllowed = hasAttemptsRemaining && (await shouldRetry(error, attempt));

      if (!retryAllowed) {
        throw error;
      }

      const delayMs = calculateBackoffDelay(attempt, baseDelayMs, maxDelayMs);
      await sleep(delayMs);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Retry attempts exhausted');
};
