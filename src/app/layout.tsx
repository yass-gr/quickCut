import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuickCut — Football Video Factory",
  description: "Generate football prediction videos for social media",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-white antialiased">{children}</body>
    </html>
  );
}
