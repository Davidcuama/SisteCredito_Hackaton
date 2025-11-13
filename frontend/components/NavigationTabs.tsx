'use client'

import { LayoutDashboard, FileText, History, ShoppingBag } from 'lucide-react'

interface NavigationTabsProps {
  activeTab: 'dashboard' | 'register' | 'history' | 'shop'
  setActiveTab: (tab: 'dashboard' | 'register' | 'history' | 'shop') => void
  address: string | null
}

export function NavigationTabs({ activeTab, setActiveTab, address }: NavigationTabsProps) {
  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'register' as const, label: 'Registrar Pago', icon: FileText },
    { id: 'history' as const, label: 'Historial', icon: History },
    { id: 'shop' as const, label: 'Tienda', icon: ShoppingBag },
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <p className="text-xs text-gray-500">Wallet conectada</p>
            <p className="text-sm font-mono text-gray-900 font-semibold">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                  isActive
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

