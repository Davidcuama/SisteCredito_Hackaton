import { Coins, Zap, Gift } from 'lucide-react'

interface RewardDisplayProps {
  rewards: {
    tokens: number
    consecutive: number
    totalEarned: number
  }
}

export function RewardDisplay({ rewards }: RewardDisplayProps) {
  return (
    <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-xl shadow-xl p-8 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Recompensas</h2>
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Tokens Actuales</span>
            </div>
            <p className="text-4xl font-bold mb-1">{rewards.tokens.toLocaleString()}</p>
            <p className="text-sm opacity-90 font-medium">SCRT</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Consecutivos</span>
            </div>
            <p className="text-4xl font-bold mb-1">{rewards.consecutive}</p>
            <p className="text-sm opacity-90 font-medium">Pagos puntuales seguidos</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Total Ganado</span>
            </div>
            <p className="text-4xl font-bold mb-1">{rewards.totalEarned.toLocaleString()}</p>
            <p className="text-sm opacity-90 font-medium">SCRT acumulados</p>
          </div>
        </div>
      </div>
    </div>
  )
}

