import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import FluidCursor from '@/components/FluidCursor'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Student Community Platform',
  description: 'A privacy-first, supportive community for students',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <FluidCursor />
          <div className="min-h-screen bg-gray-50 relative z-10">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}