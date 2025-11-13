'use client'

import { useState } from 'react'

// Datos mock para demostración sin necesidad de blockchain
export function useMockData() {
  const [stats, setStats] = useState({
    totalPayments: 12,
    onTimePayments: 10,
    score: 750,
    onTimePercentage: 83,
  })

  const [rewards, setRewards] = useState({
    tokens: 5000,
    consecutive: 8,
    totalEarned: 12000,
  })

  const [payments, setPayments] = useState([
    {
      userHash: '0x123...',
      amount: 500000,
      dueDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
      paymentDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
      isOnTime: true,
      entityHash: '0x456...',
      category: 'Servicios'
    },
    {
      userHash: '0x123...',
      amount: 300000,
      dueDate: Date.now() - 20 * 24 * 60 * 60 * 1000,
      paymentDate: Date.now() - 20 * 24 * 60 * 60 * 1000,
      isOnTime: true,
      entityHash: '0x789...',
      category: 'Crédito'
    },
    {
      userHash: '0x123...',
      amount: 200000,
      dueDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
      paymentDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
      isOnTime: true,
      entityHash: '0xabc...',
      category: 'Servicios'
    },
  ])

  const [userExists, setUserExists] = useState(true)
  const [loading, setLoading] = useState(false)

  // No necesitamos simular carga en modo demo
  const initializeUser = async () => {
    return true
  }

  const loadUserData = async () => {
    // No hacer nada en modo demo
  }

  // Convertir timestamps de milisegundos a segundos para compatibilidad
  const paymentsFormatted = payments.map(p => ({
    ...p,
    dueDate: Math.floor(p.dueDate / 1000),
    paymentDate: Math.floor(p.paymentDate / 1000),
  }))

  return {
    stats,
    rewards,
    payments: paymentsFormatted,
    userExists,
    loading,
    initializeUser,
    loadUserData,
  }
}

