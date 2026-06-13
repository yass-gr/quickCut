import type { ReactNode } from "react"

interface PhoneMockupProps {
  children: ReactNode
}

export function PhoneMockup({ children }: PhoneMockupProps) {
  return (
    <div
      style={{
        width: "55%",
        aspectRatio: "9 / 19",
        background: "#030803",
        borderRadius: 18,
        border: "2px solid #1b4d1b",
        padding: 4,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "30%",
          height: 5,
          background: "#000",
          borderRadius: "0 0 4px 4px",
          margin: "0 auto",
        }}
      />
      <div style={{ flex: 1, marginTop: 4, display: "flex", flexDirection: "column", padding: 4 }}>
        {children}
      </div>
      <div
        style={{
          width: "25%",
          height: 2,
          background: "#1b4d1b",
          borderRadius: 2,
          margin: "4px auto 0",
        }}
      />
    </div>
  )
}
