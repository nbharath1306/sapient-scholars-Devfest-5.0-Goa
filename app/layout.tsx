import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { MetaMaskProvider } from './providers'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'GateKeep - AI-Powered Blockchain Document Access Control',
  description: 'Secure your sensitive documents with wallet-based authentication and AI-powered semantic masking. Role-based access control powered by blockchain technology.',
  keywords: ['blockchain', 'document security', 'access control', 'MetaMask', 'AI', 'semantic masking', 'Web3', 'DevFest', 'Goa', 'hackathon'],
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'GateKeep - AI-Powered Blockchain Document Access Control',
    description: 'Secure your sensitive documents with wallet-based authentication and AI-powered semantic masking. Built for DevFest 5.0 Goa.',
    type: 'website',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GateKeep - AI-Powered Blockchain Document Access Control',
    description: 'Secure your sensitive documents with wallet-based authentication and AI-powered semantic masking.',
    images: ['/og-image.svg'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <MetaMaskProvider>
          {children}
        </MetaMaskProvider>
        <Analytics />
      </body>
    </html>
  )
}
