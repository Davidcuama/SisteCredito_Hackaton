'use client'

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ChartsProps {
  payments: any[]
  stats: {
    totalPayments: number
    onTimePayments: number
    score: number
    onTimePercentage: number
  }
}

export function PaymentTrendChart({ payments }: { payments: any[] }) {
  // Agrupar pagos por mes
  const monthlyData = payments.reduce((acc: any, payment: any) => {
    const date = new Date(payment.paymentDate * 1000)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, puntuales: 0, tardios: 0 }
    }
    
    if (payment.isOnTime) {
      acc[monthKey].puntuales++
    } else {
      acc[monthKey].tardios++
    }
    
    return acc
  }, {})

  const chartData = Object.values(monthlyData).map((item: any) => ({
    ...item,
    month: new Date(item.month + '-01').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
  }))

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-gray-500">No hay suficientes datos para mostrar el gráfico</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Tendencia de Pagos</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="puntuales" stroke="#10b981" name="Puntuales" strokeWidth={2} />
          <Line type="monotone" dataKey="tardios" stroke="#ef4444" name="Tardíos" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CategoryChart({ payments }: { payments: any[] }) {
  const categoryData = payments.reduce((acc: any, payment: any) => {
    const category = payment.category || 'otros'
    if (!acc[category]) {
      acc[category] = 0
    }
    acc[category]++
    return acc
  }, {})

  const chartData = Object.entries(categoryData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    cantidad: value
  }))

  if (chartData.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Pagos por Categoría</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="cantidad" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

