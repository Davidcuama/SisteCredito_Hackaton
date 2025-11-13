'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Coins, CheckCircle, AlertCircle, Loader2, Gift, Percent, CreditCard, Star, Award, DollarSign, TrendingUp } from 'lucide-react'
import { useContracts } from '@/hooks/useContracts'
import { useWeb3 } from '@/hooks/useWeb3'
import { CONTRACT_ADDRESSES } from '@/config/contracts'

interface Benefit {
  id: number
  name: string
  description: string
  cost: string
  stock: string
  active: boolean
  benefitType: number
}

const BENEFIT_TYPES = [
  { name: 'Descuento en Tasa', icon: Percent, color: 'text-blue-600' },
  { name: 'Reducción de Comisiones', icon: CreditCard, color: 'text-green-600' },
  { name: 'Acceso Premium', icon: Star, color: 'text-yellow-600' },
  { name: 'Certificado NFT', icon: Award, color: 'text-purple-600' },
  { name: 'Cashback', icon: DollarSign, color: 'text-emerald-600' },
  { name: 'Línea de Crédito', icon: TrendingUp, color: 'text-indigo-600' },
]

// Modo demo: usar datos mock
const USE_MOCK_DATA = true

// Beneficios mock para demostración
const MOCK_BENEFITS: Benefit[] = [
  {
    id: 1,
    name: "Descuento 5% Tasa de Interés",
    description: "Obtén un 5% de descuento en la tasa de interés de tu próximo crédito",
    cost: "500000000000000000000", // 500 SCRT
    stock: "0",
    active: true,
    benefitType: 0
  },
  {
    id: 2,
    name: "Reducción de Comisiones",
    description: "Reduce las comisiones de tus transacciones en un 50% por 3 meses",
    cost: "300000000000000000000", // 300 SCRT
    stock: "0",
    active: true,
    benefitType: 1
  },
  {
    id: 3,
    name: "Acceso Premium",
    description: "Acceso a productos financieros premium y atención prioritaria",
    cost: "1000000000000000000000", // 1000 SCRT
    stock: "0",
    active: true,
    benefitType: 2
  },
  {
    id: 4,
    name: "Certificado Buen Pagador",
    description: "Obtén un certificado NFT que acredita tu historial de pagos puntuales",
    cost: "200000000000000000000", // 200 SCRT
    stock: "0",
    active: true,
    benefitType: 3
  },
  {
    id: 5,
    name: "Cashback 2%",
    description: "Recibe 2% de cashback en todas tus transacciones por 1 mes",
    cost: "400000000000000000000", // 400 SCRT
    stock: "0",
    active: true,
    benefitType: 4
  },
  {
    id: 6,
    name: "Línea de Crédito Preferencial",
    description: "Acceso a línea de crédito con mejores condiciones y aprobación rápida",
    cost: "1500000000000000000000", // 1500 SCRT
    stock: "0",
    active: true,
    benefitType: 5
  }
]

export function RewardShop() {
  const { account, isConnected } = useWeb3()
  const { getContract } = useContracts()
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [userBalance, setUserBalance] = useState<string>('5000000000000000000000') // 5000 SCRT mock
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (USE_MOCK_DATA) {
      // En modo demo, usar beneficios mock
      setBenefits(MOCK_BENEFITS)
      setLoading(false)
      return
    }
    
    // Cargar beneficios siempre, incluso sin cuenta (para mostrar el catálogo)
    loadBenefits()
    if (account) {
      loadUserBalance()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, isConnected])

  const loadBenefits = async () => {
    if (USE_MOCK_DATA) {
      return // Ya se cargan en useEffect
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // Verificar que la dirección del contrato no sea la dirección cero
      if (CONTRACT_ADDRESSES.rewardShop === "0x0000000000000000000000000000000000000000") {
        setError('El contrato RewardShop no está desplegado. Por favor, despliégalo primero.')
        setLoading(false)
        return
      }
      
      console.log('Loading benefits from:', CONTRACT_ADDRESSES.rewardShop)
      
      // Verificar conexión a la red
      if (!isConnected) {
        setError('Por favor, conecta tu wallet primero para ver los beneficios disponibles.')
        setLoading(false)
        return
      }
      
      const rewardShop = await getContract('RewardShop', CONTRACT_ADDRESSES.rewardShop)
      
      if (!rewardShop) {
        console.error('RewardShop contract not available')
        setError('No se pudo conectar con el contrato RewardShop. Asegúrate de: 1) Estar conectado a la red local (localhost:8545), 2) Que Hardhat node esté corriendo, 3) Que el RewardShop esté desplegado.')
        setLoading(false)
        return
      }

      console.log('Calling getActiveBenefits...')
      const activeIds = await rewardShop.getActiveBenefits()
      console.log('Active benefit IDs:', activeIds)
      
      // Si no hay beneficios activos, mostrar mensaje
      if (!activeIds || activeIds.length === 0) {
        console.log('No active benefits found')
        setBenefits([])
        setLoading(false)
        return
      }
      
      const benefitsList: Benefit[] = []

      for (const id of activeIds) {
        try {
          console.log('Loading benefit ID:', id.toString())
          const benefit = await rewardShop.getBenefit(id)
          benefitsList.push({
            id: Number(benefit.id),
            name: benefit.name,
            description: benefit.description,
            cost: benefit.cost.toString(),
            stock: benefit.stock.toString(),
            active: benefit.active,
            benefitType: Number(benefit.benefitType),
          })
        } catch (benefitErr: any) {
          console.error(`Error loading benefit ${id}:`, benefitErr)
        }
      }

      console.log('Loaded benefits:', benefitsList.length)
      setBenefits(benefitsList)
    } catch (err: any) {
      console.error('Error loading benefits:', err)
      const errorMessage = err.message || err.reason || 'Error desconocido'
      setError(`Error al cargar los beneficios: ${errorMessage}. Asegúrate de estar conectado a la red correcta.`)
    } finally {
      setLoading(false)
    }
  }

  const loadUserBalance = async () => {
    try {
      const rewardToken = await getContract('RewardToken', CONTRACT_ADDRESSES.rewardToken)
      if (!rewardToken || !account) return

      const balance = await rewardToken.balanceOf(account)
      setUserBalance(balance.toString())
    } catch (err) {
      console.error('Error loading balance:', err)
    }
  }

  const redeemBenefit = async (benefitId: number, cost: string) => {
    try {
      setRedeeming(benefitId)
      setError(null)
      setSuccess(null)

      if (USE_MOCK_DATA) {
        // En modo demo, simular canje
        await new Promise(resolve => setTimeout(resolve, 1500))
        const costNum = BigInt(cost)
        const balanceNum = BigInt(userBalance)
        if (balanceNum >= costNum) {
          setUserBalance((balanceNum - costNum).toString())
          setSuccess(`¡Beneficio canjeado exitosamente! (Modo Demo)`)
          setTimeout(() => setSuccess(null), 5000)
        } else {
          setError('Fondos insuficientes')
          setTimeout(() => setError(null), 5000)
        }
        setRedeeming(null)
        return
      }

      const rewardShop = await getContract('RewardShop', CONTRACT_ADDRESSES.rewardShop)
      const rewardToken = await getContract('RewardToken', CONTRACT_ADDRESSES.rewardToken)
      
      if (!rewardShop || !rewardToken || !account) {
        throw new Error('Contratos no disponibles')
      }

      // Aprobar tokens primero
      const approveTx = await rewardToken.approve(CONTRACT_ADDRESSES.rewardShop, cost)
      await approveTx.wait()

      // Canjear beneficio
      const redeemTx = await rewardShop.redeemBenefit(benefitId, 1)
      await redeemTx.wait()

      setSuccess(`¡Beneficio canjeado exitosamente!`)
      await loadUserBalance()
      await loadBenefits()
      
      setTimeout(() => setSuccess(null), 5000)
    } catch (err: any) {
      console.error('Error redeeming benefit:', err)
      setError(err.message || 'Error al canjear el beneficio')
      setTimeout(() => setError(null), 5000)
    } finally {
      setRedeeming(null)
    }
  }

  const formatTokens = (tokens: string) => {
    const num = BigInt(tokens) / BigInt(10**18)
    return num.toString()
  }

  const userBalanceFormatted = formatTokens(userBalance)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
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
            <p className="text-xs text-blue-700 mt-1">Estás viendo datos de demostración. Los canjes son simulados.</p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <ShoppingBag className="w-8 h-8" />
              Tienda de Recompensas
            </h2>
            <p className="text-purple-100">Canjea tus tokens SCRT por beneficios exclusivos</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30">
            <div className="text-sm text-purple-100 mb-1">Tu Balance</div>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Coins className="w-6 h-6" />
              {userBalanceFormatted}
            </div>
            <div className="text-sm text-purple-200 mt-1">SCRT</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Benefits Grid */}
      {benefits.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay beneficios disponibles</h3>
          <p className="text-gray-500">Vuelve pronto para ver nuevos beneficios</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit) => {
            const BenefitIcon = BENEFIT_TYPES[benefit.benefitType]?.icon || Gift
            const benefitColor = BENEFIT_TYPES[benefit.benefitType]?.color || 'text-gray-600'
            const costFormatted = formatTokens(benefit.cost)
            const canAfford = BigInt(userBalance) >= BigInt(benefit.cost)
            const isRedeeming = redeeming === benefit.id
            const isOutOfStock = benefit.stock !== '0' && BigInt(benefit.stock) === BigInt(0)

            return (
              <div
                key={benefit.id}
                className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100 hover:border-primary-300 transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center ${benefitColor}`}>
                    <BenefitIcon className="w-6 h-6" />
                  </div>
                  {isOutOfStock && (
                    <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                      Agotado
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.name}</h3>
                <p className="text-gray-600 text-sm mb-4 min-h-[3rem]">{benefit.description}</p>

                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Costo:</span>
                  <span className="text-lg font-bold text-primary-600 flex items-center gap-1">
                    <Coins className="w-4 h-4" />
                    {costFormatted} SCRT
                  </span>
                </div>

                <button
                  onClick={() => redeemBenefit(benefit.id, benefit.cost)}
                  disabled={!canAfford || isRedeeming || isOutOfStock || !benefit.active}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    !canAfford || isOutOfStock || !benefit.active
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:from-primary-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  {isRedeeming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Canjeando...
                    </>
                  ) : !canAfford ? (
                    'Fondos insuficientes'
                  ) : isOutOfStock ? (
                    'Agotado'
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Canjear Ahora
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Gift className="w-5 h-5" />
          ¿Cómo funciona?
        </h3>
        <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
          <li>Gana tokens SCRT realizando pagos puntuales</li>
          <li>Acumula tokens para canjearlos por beneficios exclusivos</li>
          <li>Cada beneficio tiene un costo en tokens SCRT</li>
          <li>Los beneficios se activan automáticamente después del canje</li>
          <li>Mientras más puntual seas, más beneficios podrás obtener</li>
        </ul>
      </div>
    </div>
  )
}

