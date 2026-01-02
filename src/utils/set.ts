export function excludeFromSet<T>(set: Set<T>, toExclude: T[]): Set<T> {
  return new Set([...set].filter(value => !toExclude.includes(value)))
}
