'use client'

import { useWeb3 } from '@/hooks/useWeb3'
import { Trophy, Shield, TrendingUp, Lock, Zap, Award } from 'lucide-react'

export function WelcomeScreen() {
  const { connectWallet } = useWeb3()

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12 mb-12">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-500 to-purple-600 rounded-3xl mb-6 shadow-lg">
          <Shield className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          SisteCredito
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-2">
          Acredita tu hábito de pago responsable
        </p>
        <p className="text-lg text-gray-500">
          mediante tecnología Blockchain
        </p>
      </div>

      {/* CTA Button */}
      <div className="text-center mb-16">
        <button
          onClick={connectWallet}
          className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Zap className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
          Conectar Wallet
        </button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <FeatureCard
          icon={<Trophy className="w-8 h-8" />}
          title="Gamificación"
          description="Gana tokens SCRT por cada pago puntual. Sistema de bonos por pagos consecutivos."
          color="blue"
        />
        <FeatureCard
          icon={<Shield className="w-8 h-8" />}
          title="Privacidad Total"
          description="Tus datos personales están protegidos mediante hashing. Solo tú controlas tu información."
          color="purple"
        />
        <FeatureCard
          icon={<TrendingUp className="w-8 h-8" />}
          title="Portabilidad"
          description="Demuestra tu historial de pago a cualquier entidad sin compartir bases de datos."
          color="green"
        />
      </div>

      {/* Additional Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureCard
          icon={<Lock className="w-8 h-8" />}
          title="Seguridad Blockchain"
          description="Registros inmutables y verificables en la blockchain. Transparencia total."
          color="indigo"
        />
        <FeatureCard
          icon={<Award className="w-8 h-8" />}
          title="Recompensas Digitales"
          description="Sistema de tokens que incentiva el pago puntual. Bonus por consistencia."
          color="orange"
        />
      </div>

      {/* Stats Preview */}
      <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          ¿Cómo funciona?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StepCard
            number="1"
            title="Conecta tu Wallet"
            description="Usa MetaMask o cualquier wallet compatible"
          />
          <StepCard
            number="2"
            title="Crea tu Perfil"
            description="Genera tu hash único de forma privada"
          />
          <StepCard
            number="3"
            title="Registra Pagos"
            description="Las entidades registran tus pagos puntuales"
          />
          <StepCard
            number="4"
            title="Gana Recompensas"
            description="Recibe tokens por mantener tu historial impecable"
          />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description, color }: {
  icon: React.ReactNode
  title: string
  description: string
  color: 'blue' | 'purple' | 'green' | 'indigo' | 'orange'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  }

  return (
    <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} transition-all hover:shadow-lg hover:scale-105`}>
      <div className="mb-4">{icon}</div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-700">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full font-bold text-lg mb-3">
        {number}
      </div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}

