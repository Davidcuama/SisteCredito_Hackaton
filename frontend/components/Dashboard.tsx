'use client'

import { useEffect, useState } from 'react'
import { useWeb3 } from '@/hooks/useWeb3'
import { useMockData } from '@/hooks/useMockData'
import { StatsCard } from './StatsCard'
import { RewardDisplay } from './RewardDisplay'
import { Trophy, TrendingUp, Clock, Award } from 'lucide-react'
import { PaymentTrendChart, CategoryChart } from './Charts'

// Modo demo: usar datos mock en lugar de blockchain real
const USE_MOCK_DATA = true

export function Dashboard() {
  const { isConnected } = useWeb3()
  const mockData = useMockData()
  
  // Usar datos mock si está habilitado o si no hay conexión
  const { stats, rewards, payments, loading, userExists } = USE_MOCK_DATA || !isConnected 
    ? mockData 
    : { stats: { totalPayments: 0, onTimePayments: 0, score: 500, onTimePercentage: 0 }, rewards: { tokens: 0, consecutive: 0, totalEarned: 0 }, payments: [], loading: false, userExists: false }

  // En modo mock, no necesitamos inicializar usuario ni mostrar loading
  if (USE_MOCK_DATA) {
    // En modo demo, mostrar contenido inmediatamente
  } else if (loading && !userExists) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando tu perfil...</p>
          <p className="text-sm text-gray-500 mt-2">Esto puede tomar unos segundos</p>
          <p className="text-xs text-gray-400 mt-1">Revisa la consola (F12) si tarda mucho</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {USE_MOCK_DATA && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-5 h-5 text-blue-600 mt-0.5">ℹ️</div>
          <div>
            <p className="text-sm font-medium text-blue-800">Modo Demo</p>
            <p className="text-xs text-blue-700 mt-1">Estás viendo datos de demostración. Conecta tu wallet para usar la versión completa con blockchain.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Puntuación"
          value={stats.score}
          maxValue={1000}
          icon={<Trophy className="w-6 h-6" />}
          color="yellow"
        />
        <StatsCard
          title="Pagos Totales"
          value={stats.totalPayments}
          icon={<TrendingUp className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Pagos Puntuales"
          value={stats.onTimePayments}
          icon={<Clock className="w-6 h-6" />}
          color="green"
        />
        <StatsCard
          title="Puntualidad"
          value={stats.onTimePercentage}
          suffix="%"
          icon={<Award className="w-6 h-6" />}
          color="purple"
        />
      </div>

      <RewardDisplay rewards={rewards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progreso de Recompensas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>Progreso de Recompensas</span>
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Pagos consecutivos</span>
                <span className="text-sm font-semibold text-primary-600">
                  {rewards.consecutive} / 10
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary-500 to-purple-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${Math.min((rewards.consecutive / 10) * 100, 100)}%` }}
                >
                  {rewards.consecutive > 0 && (
                    <span className="text-xs text-white font-semibold">
                      {Math.round((rewards.consecutive / 10) * 100)}%
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {rewards.consecutive < 10 
                  ? `${10 - rewards.consecutive} pagos más para el bonus 2x`
                  : '¡Bonus desbloqueado! Próximo pago recibirá 2x recompensa'
                }
              </p>
            </div>

            {/* Nivel de Confiabilidad */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Nivel de Confiabilidad</span>
                <span className="text-sm font-semibold text-primary-600">
                  {getConfiabilityLevel(stats.score)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.score / 1000) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Puntuación: {stats.score} / 1000
              </p>
            </div>
          </div>
        </div>

        {/* Información Rápida */}
        <div className="bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">Resumen Rápido</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-primary-100">Tasa de Puntualidad</span>
              <span className="text-2xl font-bold">{stats.onTimePercentage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-primary-100">Tokens Acumulados</span>
              <span className="text-2xl font-bold">{rewards.tokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-primary-100">Total Ganado</span>
              <span className="text-2xl font-bold">{rewards.totalEarned.toLocaleString()} SCRT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      {payments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <PaymentTrendChart payments={payments} />
          <CategoryChart payments={payments} />
        </div>
      )}
    </div>
  )
}

function getConfiabilityLevel(score: number): string {
  if (score >= 900) return 'Excelente'
  if (score >= 750) return 'Muy Bueno'
  if (score >= 600) return 'Bueno'
  if (score >= 400) return 'Regular'
  return 'Mejorable'
}

