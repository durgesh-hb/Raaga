/**
 * Creates a debounced version of the provided function that delays
 * invoking the function until after `waitMs` milliseconds have elapsed
 * since the last time it was invoked.
 */
export function debounce<
  T extends (...args: any[]) => void
>(
  func: T,
  waitMs: number
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(
      () => func(...args),
      waitMs
    );
  };
}
