import { describe, it, expect } from "vitest";
import { createChoice } from "./choice.factory";

describe("createChoice", () => {
  it("returns a Choice with a non-empty UUID id when called with no arguments", () => {
    const c = createChoice();
    expect(c.id).toBeTruthy();
    expect(c.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it("returns a Choice with text empty string when called with no arguments", () => {
    expect(createChoice().text).toBe("");
  });

  it("merges overrides: text override applied, id still generated", () => {
    const c = createChoice({ text: "foo" });
    expect(c.text).toBe("foo");
    expect(c.id).toBeTruthy();
  });

  it("every call returns a different id", () => {
    expect(createChoice().id).not.toBe(createChoice().id);
  });

  it("returned object has no extra fields beyond id and text", () => {
    const c = createChoice();
    expect(Object.keys(c).sort()).toEqual(["id", "text"]);
  });
});
