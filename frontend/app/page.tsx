'use client'

import { useState, useEffect } from 'react'
import { useWeb3 } from '@/hooks/useWeb3'
import { Header } from '@/components/Header'
import { Dashboard } from '@/components/Dashboard'
import { PaymentForm } from '@/components/PaymentForm'
import { PaymentHistory } from '@/components/PaymentHistory'
import { RewardShop } from '@/components/RewardShop'
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { NavigationTabs } from '@/components/NavigationTabs'

// Modo demo: permitir usar la app sin conexión de wallet
const USE_MOCK_DATA = true

export default function Home() {
  const { isConnected, address } = useWeb3()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'register' | 'history' | 'shop'>('dashboard')

  // Mostrar la app solo si hay wallet conectada
  // En modo demo, los componentes cargarán datos mock automáticamente
  // Si no hay wallet, mostrar WelcomeScreen para que el usuario pueda conectar
  const showApp = isConnected
  
  // Resetear tab cuando se desconecta
  useEffect(() => {
    if (!isConnected && !USE_MOCK_DATA) {
      setActiveTab('dashboard')
    }
  }, [isConnected])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {!showApp ? (
          <WelcomeScreen />
        ) : (
          <>
            <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} address={address || 'Demo Mode'} />
            
            <div className="mt-6">
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'register' && <PaymentForm />}
              {activeTab === 'history' && <PaymentHistory />}
              {activeTab === 'shop' && <RewardShop />}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

