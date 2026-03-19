import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SKILL Lab - A/B Writing Style Tester',
  description: 'Compare how different writing philosophy instruction sets transform text using in-browser AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0f0f0f]">
        {children}
      </body>
    </html>
  )
}