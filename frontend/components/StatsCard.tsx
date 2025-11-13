import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: number
  maxValue?: number
  suffix?: string
  icon: ReactNode
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  purple: 'bg-purple-100 text-purple-600',
  red: 'bg-red-100 text-red-600',
}

export function StatsCard({ title, value, maxValue, suffix = '', icon, color }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={colorClasses[color]}>{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-gray-900">
          {value.toLocaleString()}
          {suffix}
        </p>
        {maxValue && (
          <p className="text-sm text-gray-500">/ {maxValue.toLocaleString()}</p>
        )}
      </div>
      {maxValue && (
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${colorClasses[color].split(' ')[0]}`}
            style={{ width: `${(value / maxValue) * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}

