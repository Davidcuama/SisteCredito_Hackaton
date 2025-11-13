'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ethers } from 'ethers'

interface Web3ContextType {
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  address: string | null
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnect: () => void
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Verificar si ya hay una wallet conectada
    if (typeof window !== 'undefined' && window.ethereum) {
      checkConnection()
    }
  }, [])

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          const signer = await provider.getSigner()
          const address = await signer.getAddress()
          setProvider(provider)
          setSigner(signer)
          setAddress(address)
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Por favor instala MetaMask u otra wallet compatible')
      return
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      
      // Verificar la red actual
      const network = await provider.getNetwork()
      const currentChainId = Number(network.chainId)
      
      // Si estamos en localhost (Chain ID 1337), no cambiar la red
      // Si estamos en otra red, intentar cambiar a localhost o Shibuya según configuración
      if (currentChainId !== 1337 && currentChainId !== 81) {
        // Intentar cambiar a localhost primero (para desarrollo)
        try {
          await provider.send('wallet_switchEthereumChain', [{ chainId: '0x539' }]) // 1337 en hex
        } catch (switchError: any) {
          // Si localhost no existe, agregarlo
          if (switchError.code === 4902) {
            try {
              await provider.send('wallet_addEthereumChain', [{
                chainId: '0x539', // 1337 en hexadecimal
                chainName: 'Hardhat Local',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['http://127.0.0.1:8545'],
                blockExplorerUrls: [],
              }])
            } catch (addError) {
              console.log('No se pudo agregar red local, continuando...')
            }
          }
        }
      }
      
      await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()

      setProvider(provider)
      setSigner(signer)
      setAddress(address)
      setIsConnected(true)

      // Escuchar cambios de cuenta
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          checkConnection()
        }
      })

      // Escuchar cambios de red
      window.ethereum.on('chainChanged', () => {
        checkConnection()
      })
    } catch (error) {
      console.error('Error connecting wallet:', error)
      alert('Error al conectar la wallet: ' + (error as Error).message)
    }
  }

  const disconnect = () => {
    setProvider(null)
    setSigner(null)
    setAddress(null)
    setIsConnected(false)
  }

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        address,
        isConnected,
        connectWallet,
        disconnect,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

// Extender Window interface para TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}

