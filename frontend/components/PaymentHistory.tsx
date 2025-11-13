'use client'

import { useWeb3 } from '@/hooks/useWeb3'
import { useUserData } from '@/hooks/useUserData'
import { useMockData } from '@/hooks/useMockData'
import { CheckCircle, XCircle, Calendar, DollarSign, Loader2 } from 'lucide-react'

// Modo demo: usar datos mock
const USE_MOCK_DATA = true

export function PaymentHistory() {
  const { isConnected } = useWeb3()
  const realData = useUserData()
  const mockData = useMockData()
  
  // Usar datos mock si está habilitado o si no hay conexión
  const { payments, loading } = USE_MOCK_DATA || !isConnected ? mockData : realData

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Historial de Pagos</h2>
        {payments.length > 0 && (
          <span className="text-sm text-gray-500">
            {payments.length} {payments.length === 1 ? 'pago' : 'pagos'} registrado{payments.length === 1 ? '' : 's'}
          </span>
        )}
      </div>
      
      {payments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg mb-2">No hay pagos registrados aún</p>
          <p className="text-sm text-gray-400">Los pagos registrados aparecerán aquí</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment, index) => (
            <div
              key={index}
              className={`border-2 rounded-xl p-6 transition-all hover:shadow-md ${
                payment.isOnTime 
                  ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50' 
                  : 'border-red-200 bg-gradient-to-br from-red-50 to-rose-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    {payment.isOnTime ? (
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {payment.category?.charAt(0).toUpperCase() + payment.category?.slice(1) || 'Pago'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Hash: {payment.entityHash?.slice(0, 10)}...
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-xs font-semibold ${
                      payment.isOnTime
                        ? 'bg-green-200 text-green-800'
                        : 'bg-red-200 text-red-800'
                    }`}>
                      {payment.isOnTime ? '✓ Puntual' : '✗ Tardío'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Monto
                      </p>
                      <p className="font-bold text-gray-900">{formatCurrency(payment.amount || 0)}</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Vencimiento
                      </p>
                      <p className="font-semibold text-gray-900">{formatDate(payment.dueDate)}</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Fecha de Pago</p>
                      <p className="font-semibold text-gray-900">{formatDate(payment.paymentDate)}</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Categoría</p>
                      <p className="font-semibold text-gray-900 capitalize">{payment.category || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
