import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sticky - Custom Sticker Design for Tradespeople',
  description: 'Design custom die-cut stickers with AI-powered tools, 3D previews, and professional printing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
