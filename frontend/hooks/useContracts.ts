'use client'

import { useState, useEffect } from 'react'
import { useWeb3 } from './useWeb3'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESSES } from '@/config/contracts'

// ABI simplificado - En producción, importar desde artifacts
const PAYMENT_CREDENTIAL_ABI = [
  "function createUser(bytes32 userHash) external",
  "function createUserWithAddress(bytes32 userHash, address userAddress) external",
  "function createUserWithRewards(bytes32 userHash, address userAddress) external",
  "function registerPayment(bytes32 userHash, uint256 amount, uint256 dueDate, uint256 paymentDate, bytes32 entityHash, string memory category) external",
  "function getUserProfile(bytes32 userHash) external view returns (tuple(bytes32 userHash, uint256 totalPayments, uint256 onTimePayments, uint256 score, uint256 lastUpdate, bool exists))",
  "function getUserStats(bytes32 userHash) external view returns (uint256 totalPayments, uint256 onTimePayments, uint256 score, uint256 onTimePercentage)",
  "function getUserPayments(bytes32 userHash) external view returns (tuple(bytes32 userHash, uint256 amount, uint256 dueDate, uint256 paymentDate, bool isOnTime, bytes32 entityHash, string category)[] memory)",
  "event PaymentRegistered(bytes32 indexed userHash, bytes32 indexed paymentHash, uint256 amount, bool isOnTime, uint256 newScore)",
  "event UserCreated(bytes32 indexed userHash, address indexed creator)"
]

const REWARD_TOKEN_ABI = [
  "function getUserRewardStats(bytes32 userHash) external view returns (uint256 consecutiveCount, uint256 totalEarnedTokens, uint256 userBalance, address userAddress)",
  "function balanceOf(address account) external view returns (uint256)",
  "function getRewardInfo() external view returns (uint256 rewardPerPayment, uint256 threshold, uint256 multiplier, uint256 contractBalance)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)"
]

const REWARD_SHOP_ABI = [
  "function getBenefit(uint256 benefitId) external view returns (tuple(uint256 id, string name, string description, uint256 cost, uint256 stock, bool active, uint8 benefitType))",
  "function getActiveBenefits() external view returns (uint256[] memory)",
  "function redeemBenefit(uint256 benefitId, uint256 quantity) external",
  "function getUserRedemptionHistory(address user) external view returns (uint256[] memory)",
  "function getUserRedemptionCount(address user, uint256 benefitId) external view returns (uint256)"
]

export function useContracts() {
  const { provider, signer, address, isConnected } = useWeb3()
  const [paymentCredential, setPaymentCredential] = useState<ethers.Contract | null>(null)
  const [rewardToken, setRewardToken] = useState<ethers.Contract | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log('useContracts useEffect:', { isConnected, hasSigner: !!signer, hasProvider: !!provider })
    
    const initializeContracts = async () => {
      if (!isConnected) {
        console.log('Not connected, skipping contract initialization')
        return
      }

      if (CONTRACT_ADDRESSES.paymentCredentialWithRewards === "0x0000000000000000000000000000000000000000") {
        console.warn('Contract address not set')
        return
      }

      try {
        // Intentar obtener signer o provider
        let contractSigner = signer
        
        // Si no hay signer pero hay provider, usar provider (solo lectura)
        if (!contractSigner && provider) {
          console.log('No signer available, using provider for read-only access')
          contractSigner = provider
        }
        
        // Si aún no hay nada, intentar crear provider desde window.ethereum
        if (!contractSigner && typeof window !== 'undefined' && window.ethereum) {
          console.log('Creating provider from window.ethereum')
          contractSigner = new ethers.BrowserProvider(window.ethereum)
        }
        
        if (!contractSigner) {
          console.warn('No signer or provider available for contract initialization')
          return
        }
        
        console.log('Initializing PaymentCredentialWithRewards contract at:', CONTRACT_ADDRESSES.paymentCredentialWithRewards)
        const paymentContract = new ethers.Contract(
          CONTRACT_ADDRESSES.paymentCredentialWithRewards,
          PAYMENT_CREDENTIAL_ABI,
          contractSigner
        )
        setPaymentCredential(paymentContract)
        console.log('✅ PaymentCredential contract initialized successfully')

        if (CONTRACT_ADDRESSES.rewardToken !== "0x0000000000000000000000000000000000000000") {
          const rewardContract = new ethers.Contract(
            CONTRACT_ADDRESSES.rewardToken,
            REWARD_TOKEN_ABI,
            contractSigner
          )
          setRewardToken(rewardContract)
          console.log('✅ RewardToken contract initialized successfully')
        }
      } catch (error) {
        console.error('❌ Error initializing contracts:', error)
      }
    }

    // Pequeño delay para asegurar que provider/signer estén listos
    const timer = setTimeout(() => {
      initializeContracts()
    }, 100)

    return () => clearTimeout(timer)
  }, [isConnected, signer, provider])

  // Generar hash de usuario
  const generateUserHash = (identifier: string, salt: string = ""): string => {
    const input = identifier + salt
    return ethers.keccak256(ethers.toUtf8Bytes(input))
  }

  // Generar hash de entidad
  const generateEntityHash = (entityName: string, entityId: string): string => {
    const input = entityName + entityId
    return ethers.keccak256(ethers.toUtf8Bytes(input))
  }

  // Crear usuario
  const createUser = async (identifier: string) => {
    console.log('createUser called:', { hasPaymentCredential: !!paymentCredential, address, identifier })
    
    if (!paymentCredential) {
      console.error('PaymentCredential contract not available')
      console.log('Current state:', { isConnected, hasSigner: !!signer, hasProvider: !!provider })
      throw new Error('Contract not available. Asegúrate de estar conectado a la red correcta y que Hardhat node esté corriendo.')
    }
    if (!address) {
      throw new Error('Address not available. Asegúrate de tener tu wallet conectada.')
    }
    if (!signer) {
      throw new Error('Signer not available. Asegúrate de tener tu wallet conectada y autorizada.')
    }
    
    setLoading(true)
    try {
      const userHash = generateUserHash(identifier, address)
      console.log('Creating user with hash:', userHash, 'and address:', address)
      
      // Usar createUserWithAddress primero (más confiable)
      // Luego intentar registrar en RewardToken si es posible
      try {
        console.log('Creating user with createUserWithAddress...')
        const tx = await paymentCredential.createUserWithAddress(userHash, address)
        console.log('Transaction sent, waiting for confirmation...')
        await tx.wait()
        console.log('User created successfully with address')
        
        // Nota: El registro en RewardToken se hará automáticamente cuando se registre el primer pago
        // o puede hacerse manualmente si es necesario
        
        return userHash
      } catch (error: any) {
        // Si createUserWithAddress falla, intentar createUser básico
        if (error.message?.includes('Not authorized') || error.reason?.includes('Not authorized')) {
          console.log('createUserWithAddress requires authorization, trying basic createUser...')
          const tx = await paymentCredential.createUser(userHash)
          await tx.wait()
          console.log('User created successfully (basic)')
          return userHash
        }
        throw error
      }
    } catch (error: any) {
      console.error('Error in createUser:', error)
      throw new Error(error.message || error.reason || 'Error desconocido al crear el usuario')
    } finally {
      setLoading(false)
    }
  }

  // Obtener estadísticas del usuario
  const getUserStats = async (userHash: string) => {
    if (!paymentCredential) throw new Error('Contract not available')
    
    try {
      const stats = await paymentCredential.getUserStats(userHash)
      return {
        totalPayments: Number(stats.totalPayments),
        onTimePayments: Number(stats.onTimePayments),
        score: Number(stats.score),
        onTimePercentage: Number(stats.onTimePercentage)
      }
    } catch (error) {
      console.error('Error getting user stats:', error)
      return null
    }
  }

  // Obtener recompensas del usuario
  const getUserRewards = async (userHash: string) => {
    if (!rewardToken) return null
    
    try {
      const stats = await rewardToken.getUserRewardStats(userHash)
      return {
        consecutive: Number(stats.consecutiveCount),
        totalEarned: Number(stats.totalEarnedTokens) / 1e18,
        balance: Number(stats.userBalance) / 1e18,
        address: stats.userAddress
      }
    } catch (error) {
      console.error('Error getting rewards:', error)
      return null
    }
  }

  // Obtener historial de pagos
  const getUserPayments = async (userHash: string) => {
    if (!paymentCredential) return []
    
    try {
      const payments = await paymentCredential.getUserPayments(userHash)
      return payments.map((p: any) => ({
        userHash: p.userHash,
        amount: Number(p.amount) / 1e18,
        dueDate: Number(p.dueDate),
        paymentDate: Number(p.paymentDate),
        isOnTime: p.isOnTime,
        entityHash: p.entityHash,
        category: p.category
      }))
    } catch (error) {
      console.error('Error getting payments:', error)
      return []
    }
  }

  // Función genérica para obtener cualquier contrato
  const getContract = async (contractName: string, address: string) => {
    if (address === "0x0000000000000000000000000000000000000000") {
      return null
    }

    try {
      let abi: any[] = []
      
      switch (contractName) {
        case 'PaymentCredential':
        case 'PaymentCredentialWithRewards':
          abi = PAYMENT_CREDENTIAL_ABI
          break
        case 'RewardToken':
          abi = REWARD_TOKEN_ABI
          break
        case 'RewardShop':
          abi = REWARD_SHOP_ABI
          break
        default:
          return null
      }

      // Si hay signer, usarlo (para transacciones)
      // Si no hay signer pero hay provider, usar provider (solo lectura)
      if (signer) {
        return new ethers.Contract(address, abi, signer)
      } else if (provider) {
        return new ethers.Contract(address, abi, provider)
      } else if (typeof window !== 'undefined' && window.ethereum) {
        // Intentar crear un provider desde window.ethereum
        const fallbackProvider = new ethers.BrowserProvider(window.ethereum)
        return new ethers.Contract(address, abi, fallbackProvider)
      }
      
      return null
    } catch (error) {
      console.error(`Error getting contract ${contractName}:`, error)
      return null
    }
  }

  return {
    paymentCredential,
    rewardToken,
    loading,
    createUser,
    getUserStats,
    getUserRewards,
    getUserPayments,
    generateUserHash,
    generateEntityHash,
    getContract,
    isReady: isConnected && paymentCredential !== null && signer !== null
  }
}

