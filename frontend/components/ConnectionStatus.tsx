'use client'

import { useEffect, useState } from 'react'
import { useWeb3 } from '@/hooks/useWeb3'
import { useContracts } from '@/hooks/useContracts'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'

export function ConnectionStatus() {
  const { isConnected, address, provider, signer } = useWeb3()
  const { paymentCredential, isReady } = useContracts()
  const [hardhatStatus, setHardhatStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')

  useEffect(() => {
    const checkHardhat = async () => {
      try {
        if (provider) {
          const network = await provider.getNetwork()
          const chainId = Number(network.chainId)
          if (chainId === 1337) {
            // Intentar hacer una llamada simple para verificar
            const blockNumber = await provider.getBlockNumber()
            setHardhatStatus('connected')
          } else {
            setHardhatStatus('disconnected')
          }
        } else {
          setHardhatStatus('disconnected')
        }
      } catch (error) {
        setHardhatStatus('disconnected')
      }
    }

    if (isConnected) {
      checkHardhat()
    }
  }, [isConnected, provider])

  if (!isConnected) {
    return null
  }

  const issues: string[] = []
  const checks: { label: string; status: boolean }[] = []

  checks.push({ label: 'Wallet conectada', status: isConnected })
  checks.push({ label: 'Dirección disponible', status: !!address })
  checks.push({ label: 'Provider disponible', status: !!provider })
  checks.push({ label: 'Signer disponible', status: !!signer })
  checks.push({ label: 'Contrato inicializado', status: !!paymentCredential })
  checks.push({ label: 'Hardhat node conectado', status: hardhatStatus === 'connected' })
  checks.push({ label: 'Sistema listo', status: isReady })

  checks.forEach(check => {
    if (!check.status) {
      issues.push(check.label)
    }
  })

  // Siempre mostrar el estado si hay algún problema o si está verificando
  if (issues.length === 0 && hardhatStatus === 'connected') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <h3 className="text-sm font-semibold text-green-800">✅ Todo conectado correctamente</h3>
            <p className="text-xs text-green-700 mt-1">Sistema listo para usar</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">Estado de Conexión</h3>
          <div className="space-y-1">
            {checks.map((check, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                {check.status ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <span className={check.status ? 'text-green-700' : 'text-red-700'}>
                  {check.label}
                </span>
              </div>
            ))}
          </div>
          {hardhatStatus === 'disconnected' && (
            <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
              <strong>⚠️ Hardhat node no está corriendo</strong>
              <p className="mt-1">Ejecuta en una terminal: <code className="bg-yellow-200 px-1 rounded">npx hardhat node</code></p>
            </div>
          )}
          {!signer && (
            <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
              <strong>⚠️ Signer no disponible</strong>
              <p className="mt-1">Asegúrate de tener tu wallet conectada y autorizada en MetaMask</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

