'use client'

import { useState, useEffect } from 'react'
import { useWeb3 } from './useWeb3'
import { useContracts } from './useContracts'

export function useUserData() {
  const { address, isConnected } = useWeb3()
  const { generateUserHash, getUserStats, getUserRewards, getUserPayments, createUser, isReady } = useContracts()
  const [userHash, setUserHash] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalPayments: 0,
    onTimePayments: 0,
    score: 500,
    onTimePercentage: 0,
  })
  const [rewards, setRewards] = useState({
    tokens: 0,
    consecutive: 0,
    totalEarned: 0,
  })
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [userExists, setUserExists] = useState(false)

  useEffect(() => {
    console.log('useUserData useEffect:', { isConnected, address, isReady })
    if (isConnected && address && isReady) {
      // Primero intentar cargar datos del usuario (puede que ya exista)
      loadUserData().then(() => {
        // Si después de cargar no existe, entonces intentar crear
        // Pero no hacerlo automáticamente aquí, dejar que el Dashboard lo maneje
      })
    } else {
      console.log('Not loading user data:', { isConnected, hasAddress: !!address, isReady })
    }
  }, [isConnected, address, isReady])

  const loadUserData = async () => {
    if (!address) return

    setLoading(true)
    try {
      // Generar hash del usuario basado en su address
      const hash = generateUserHash(address, address)
      setUserHash(hash)

      // Intentar cargar datos del usuario
      try {
        const userStats = await getUserStats(hash)
        if (userStats && userStats.totalPayments !== undefined) {
          setStats(userStats)
          setUserExists(true)
          console.log('User exists, data loaded:', userStats)

          // Cargar recompensas
          try {
            const userRewards = await getUserRewards(hash)
            if (userRewards) {
              setRewards({
                tokens: userRewards.balance,
                consecutive: userRewards.consecutive,
                totalEarned: userRewards.totalEarned,
              })
            }
          } catch (rewardError) {
            console.warn('Error loading rewards (user may not be registered in RewardToken):', rewardError)
            // No es crítico, continuar sin recompensas
          }

          // Cargar historial de pagos
          try {
            const userPayments = await getUserPayments(hash)
            setPayments(userPayments || [])
          } catch (paymentError) {
            console.warn('Error loading payments:', paymentError)
            setPayments([])
          }
        } else {
          // Usuario no existe aún
          setUserExists(false)
          console.log('User does not exist yet')
        }
      } catch (statsError: any) {
        // Si getUserStats falla, puede ser que el usuario no exista
        console.log('getUserStats failed, user may not exist:', statsError.message)
        setUserExists(false)
      }
    } catch (error: any) {
      console.error('Error loading user data:', error)
      // Si el error es que el contrato no está disponible, no marcar como error fatal
      if (error.message?.includes('Contract not available') || error.message?.includes('not available')) {
        console.warn('Contract not ready yet, will retry')
        setUserExists(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const initializeUser = async () => {
    if (!address) {
      console.error('No address available for user initialization')
      return false
    }

    setLoading(true)
    try {
      console.log('Initializing user with address:', address)
      const hash = await createUser(address)
      console.log('User created with hash:', hash)
      setUserHash(hash)
      setUserExists(true)
      await loadUserData()
      return true
    } catch (error: any) {
      console.error('Error initializing user:', error)
      const errorMsg = error.message || error.reason || 'Error desconocido'
      
      // Si el error es que el usuario ya existe, marcarlo como existente y cargar datos
      if (errorMsg.includes('already exists') || errorMsg.includes('User already exists')) {
        console.log('User already exists, loading data...')
        setUserExists(true)
        await loadUserData()
        return true
      }
      
      // Si el error es de autorización o require(false), el usuario puede que ya exista
      if (errorMsg.includes('Not authorized') || errorMsg.includes('require(false)') || errorMsg.includes('execution reverted')) {
        console.log('Transaction reverted, user may already exist. Checking and loading data...')
        // Intentar verificar si el usuario existe directamente
        try {
          const hash = generateUserHash(address, address)
          const userStats = await getUserStats(hash)
          if (userStats && userStats.totalPayments !== undefined) {
            console.log('User actually exists! Loading full data...')
            setUserExists(true)
            setUserHash(hash)
            setStats(userStats)
            
            // Cargar recompensas
            try {
              const userRewards = await getUserRewards(hash)
              if (userRewards) {
                setRewards({
                  tokens: userRewards.balance,
                  consecutive: userRewards.consecutive,
                  totalEarned: userRewards.totalEarned,
                })
              }
            } catch (rewardError) {
              console.warn('Error loading rewards:', rewardError)
            }
            
            // Cargar pagos
            try {
              const userPayments = await getUserPayments(hash)
              setPayments(userPayments || [])
            } catch (paymentError) {
              console.warn('Error loading payments:', paymentError)
              setPayments([])
            }
            
            return true
          }
        } catch (loadError) {
          console.warn('Could not verify if user exists:', loadError)
        }
      }
      
      // Mostrar error más descriptivo
      console.error('Full error details:', error)
      alert(`Error al crear el usuario: ${errorMsg}. Por favor, verifica la consola (F12) para más detalles.`)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    userHash,
    stats,
    rewards,
    payments,
    loading,
    userExists,
    loadUserData,
    initializeUser,
  }
}

