import type React from "react"
import type { Metadata } from "next"
import { Audiowide } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"

const font = Audiowide({
  subsets: ["latin"],
  weight: ["400"],
})
export const metadata: Metadata = {
  title: "BLUDHAVEN | Project Management for Solo Operators",
  description: "Project Management Dashboard",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${font.className} bg-black text-white`}>{children}

        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
