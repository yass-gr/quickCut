import { describe, it, expect } from "vitest"

describe("render pipeline", () => {
  it("has the render function module", () => {
    const renderModule = require("@/lib/render")
    expect(typeof renderModule.renderVideo).toBe("function")
  })
})
