import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WGMN',
  description: 'Welcome to WGMN',
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
