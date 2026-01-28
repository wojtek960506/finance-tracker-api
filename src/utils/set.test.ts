import { excludeFromSet } from "./set";
import { describe, expect, it } from "vitest";


describe("excludeFromSet", () => {
  it("value is not anymore in set when excluded", () => {
    const oldSet = new Set(["a", "b", "c", "d"]);
    const newSet = excludeFromSet(oldSet, ["b", "c"]);

    expect(oldSet).toEqual(new Set(["a", "b", "c", "d"]));
    expect(newSet).toEqual(new Set(["a", "d"]));
  })

  it("when value was not in set is still not in set after excluding", () => {
    const oldSet = new Set(["a", "b", "c", "d"]);
    const newSet = excludeFromSet(oldSet, ["e", "f"]);

    expect(oldSet).toEqual(new Set(["a", "b", "c", "d"]));
    expect(newSet).toEqual(oldSet);
  })
})