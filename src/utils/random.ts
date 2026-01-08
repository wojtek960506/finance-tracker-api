export const randomDate = (from: Date, to: Date): Date => {
  const fromTime = from.getTime();
  const toTime = to.getTime();

  const randomTime = fromTime + Math.random() * (toTime - fromTime);
  return new Date(randomTime);
}

export const randomNumber = (from: number, to: number) => {
  return from + Math.random() * (to - from);
}

export function randomFromSet<T>(set: Set<T>): T {
  const values = Array.from(set);
  const index = Math.floor(Math.random() * (values.length - 1));
  return values[index];
}

export function weightedRandomFromSet<T extends string | number>(
  set: Set<T>,
  weights: Record<T, number>
): T {
  const weightsMap = new Map([...set].map(value => [value, weights[value]]));
  const totalWeight = [...weightsMap.values()].reduce((a, b) => a + b, 0);

  let random = Math.random() * totalWeight;

  for (const [value, weight] of weightsMap) {
    random -= weight;
    if (random <= 0) return value;
  }

  throw new Error("invalid weights");
}
