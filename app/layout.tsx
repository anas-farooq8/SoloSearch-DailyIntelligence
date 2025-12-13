import type { Metadata } from "next"
import type React from "react"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { Geist, Geist_Mono, Source_Serif_4 } from 'next/font/google'

// Initialize fonts
const geist = Geist({ 
  subsets: ['latin'], 
  weight: ["100","200","300","400","500","600","700","800","900"],
  variable: '--font-geist'
})

const geistMono = Geist_Mono({ 
  subsets: ['latin'], 
  weight: ["100","200","300","400","500","600","700","800","900"],
  variable: '--font-geist-mono'
})

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: '--font-source-serif'
})

export const metadata: Metadata = {
  title: "SoloSearch-DailyIntelligence",
  description: "Daily Intelligence Dashboard for Solo Search - NHS & Digital market signals",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: 'https://www.google.com/s2/favicons?domain=https://www.solosearch.co.uk/&sz=32',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: 'https://www.google.com/s2/favicons?domain=https://www.solosearch.co.uk/&sz=64',
        sizes: '64x64',
        type: 'image/png',
      },
    ],
    apple: {
      url: 'https://www.google.com/s2/favicons?domain=https://www.solosearch.co.uk/&sz=180',
      sizes: '180x180',
      type: 'image/png',
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} ${sourceSerif.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
