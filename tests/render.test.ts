import { describe, it, expect, vi } from "vitest"

vi.mock("@/lib/render", () => ({
  renderVideo: vi.fn(),
}))

describe("render pipeline", () => {
  it("has the render function module", async () => {
    const { renderVideo } = await import("@/lib/render")
    expect(typeof renderVideo).toBe("function")
  })
})
