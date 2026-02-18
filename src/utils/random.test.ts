
import { describe, vi, beforeEach, it, expect } from "vitest";
import { randomDate, randomFromSet, randomNumber, weightedRandomFromSet } from "./random";

describe("randomDate", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const from = new Date("2025-01-01");
  const to = new Date("2025-12-31");

  it.each([
    ["returns date at end when Math.random() == 0", 0, from],
    ["returns date at end when Math.random() == 1", 1, to],
  ])("%s", (_title, randomValue, expectedValue) => {
    vi.spyOn(Math, "random").mockReturnValue(randomValue);
    const result = randomDate(from, to);
    expect(result).toEqual(expectedValue);
  })
})

describe("randomNumber", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ["returns begin of range when Math.random() == 0", 0, 10, 0, 0],
    ["returns end of range when Math.random() == 1", 0, 10, 1, 10],
    ["returns middle of range when Math.random() == 0.5", 0, 10, 0.5, 5],
  ])("%s", (_title, from, to, randomValue, expectedValue) => {
    vi.spyOn(Math, "random").mockReturnValue(randomValue);
    const result = randomNumber(from, to);
    expect(result).toEqual(expectedValue);
  })
})

describe("randomFromSet", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ["returns first element of set when Math.random() == 0", new Set([1,2,3]), 0, 1],
    ["returns last element of set when Math.random() == 1", new Set([1,2,3]), 1, 3],
    ["returns middle element of set when Math.random() == 0.5", new Set([1,2,3]), 0.5, 2],
  ])("%s", (_title, testSet, randomValue, expectedValue) => {
    vi.spyOn(Math, "random").mockReturnValue(randomValue);
    const result = randomFromSet(testSet);
    expect(result).toEqual(expectedValue);
  })
})

describe("weigthedRandomFromSet", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("maps random ranges to values according to weights", () => {
    const values = new Set([1, 2, 3]);
    const weights = { 1: 150, 2: 45, 3: 5,}
    const totalWeight = 200;

    vi.spyOn(Math, "random").mockReturnValue(149 / totalWeight);
    expect(weightedRandomFromSet(values, weights)).toBe(1);
    vi.spyOn(Math, "random").mockReturnValue(165 / totalWeight);
    expect(weightedRandomFromSet(values, weights)).toBe(2);
    vi.spyOn(Math, "random").mockReturnValue(199 / totalWeight);
    expect(weightedRandomFromSet(values, weights)).toBe(3);
  })

  it("value with bigger weight tends to be chosen more often", () => {
    const values = new Set([1, 2, 3]);
    const weights = { 1: 150, 2: 45, 3: 5,}

    const occurrences = new Map<number, number>([
      [1, 0],
      [2, 0],
      [3, 0],
    ]);

    for (let i = 0; i < 10000 ; i++) {
      const result = weightedRandomFromSet(values, weights);
      occurrences.set(result, occurrences.get(result)! + 1);
    }

    const valuesSortedByWeight = Object.entries(weights)
      .sort((a,b) => b[1] - a[1])
      .map(x => Number(x[0]));
    const valuesSortedByOccurrences = [...occurrences.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(x => Number(x[0]));

    expect(valuesSortedByOccurrences).toEqual(valuesSortedByWeight);
  })

  it("value with weight equal 0 is never chosen", () => {
    const values = new Set([1, 2, 3, 4, 5]);
    const weights = { 1: 10, 2: 7, 3: 4, 4: 2, 5: 0 }

    let occurrences = 0;
    for (let i = 0; i < 100 ; i++) {
      const result = weightedRandomFromSet(values, weights);
      if (result === 5) occurrences += 1;  
    }
  
    expect(occurrences).toBe(0);
  })

  it("throws if weights are lower than 0 and result of random is 0", () => {
    const values = new Set([1,2,3]);
    const weights = { 1: -1, 2: -2, 3: -3 };
    vi.spyOn(Math, "random").mockReturnValue(0);

    expect(() => weightedRandomFromSet(values, weights)).toThrow();
  })
})
