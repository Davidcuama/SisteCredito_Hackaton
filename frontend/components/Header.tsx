'use client'

import { useWeb3 } from '@/hooks/useWeb3'
import { Shield, LogOut } from 'lucide-react'

export function Header() {
  const { isConnected, address, disconnect } = useWeb3()

  return (
    <header className="bg-white shadow-md border-b border-gray-100">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                SisteCredito
              </h1>
              <p className="text-xs text-gray-500">Blockchain Payment Credentials</p>
            </div>
          </div>
          {isConnected && (
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="text-gray-500">Conectado como</p>
                <p className="font-mono text-gray-900">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
              </div>
              <button
                onClick={disconnect}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Desconectar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

