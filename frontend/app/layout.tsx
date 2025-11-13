import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Web3Provider } from '@/components/Web3Provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SisteCredito - Acreditación del Pago Puntual',
  description: 'Sistema blockchain para acreditar el hábito de pago responsable',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}

