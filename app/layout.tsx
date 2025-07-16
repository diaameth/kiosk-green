import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SMK PAY",
  description: "Application mobile pour agents Kiosque",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-0">
          <div className="relative w-full h-screen sm:w-full sm:max-w-sm sm:h-[926px] sm:max-h-[926px] bg-white sm:rounded-3xl sm:shadow-2xl overflow-hidden">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}

