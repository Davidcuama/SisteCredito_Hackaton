'use client'

import { useWeb3 } from '@/hooks/useWeb3'
import { Shield, LogOut } from 'lucide-react'

export function Header() {
  const { isConnected, address, disconnect } = useWeb3()
  
  const handleDisconnect = () => {
    disconnect()
    // No necesitamos recargar la página, el estado se actualizará automáticamente
  }

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
            <div className="flex items-center gap-3">
              <div className="text-sm text-right">
                <p className="text-gray-500 text-xs">Conectado como</p>
                <p className="font-mono text-gray-900 font-semibold">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
              </div>
              <button
                onClick={async () => {
                  if (window.ethereum) {
                    try {
                      // Intentar cambiar de cuenta primero
                      await window.ethereum.request({
                        method: 'wallet_requestPermissions',
                        params: [{ eth_accounts: {} }]
                      })
                      // Si el usuario cancela o cambia de cuenta, el listener de accountsChanged lo manejará
                    } catch (error) {
                      // Si falla, simplemente desconectar
                      disconnect()
                    }
                  } else {
                    disconnect()
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                title="Cambiar de wallet"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Cambiar
              </button>
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                title="Desconectar wallet"
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

