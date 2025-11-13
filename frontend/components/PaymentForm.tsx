'use client'

import { useState } from 'react'
import { useWeb3 } from '@/hooks/useWeb3'
import { ethers } from 'ethers'
import { CheckCircle } from 'lucide-react'

export function PaymentForm() {
  const { signer, address } = useWeb3()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    dueDate: '',
    paymentDate: '',
    category: 'servicios',
    entityName: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signer || !address) {
      alert('Por favor conecta tu wallet primero')
      return
    }

    setLoading(true)
    try {
      // Nota: En producción, esto debería ser llamado por una entidad autorizada
      // Por ahora, mostramos un mensaje informativo
      alert('Nota: El registro de pagos debe ser realizado por una entidad autorizada. Esta función está en desarrollo.')
      
      // TODO: Implementar llamada al contrato cuando se despliegue
      // const { generateUserHash, generateEntityHash, paymentCredential } = useContracts()
      // const userHash = generateUserHash(address, address)
      // const entityHash = generateEntityHash(formData.entityName, 'entity-id')
      // const dueDateTimestamp = Math.floor(new Date(formData.dueDate).getTime() / 1000)
      // const paymentDateTimestamp = Math.floor(new Date(formData.paymentDate).getTime() / 1000)
      // const amountWei = ethers.parseEther(formData.amount)
      // 
      // const tx = await paymentCredential.registerPayment(
      //   userHash,
      //   amountWei,
      //   dueDateTimestamp,
      //   paymentDateTimestamp,
      //   entityHash,
      //   formData.category
      // )
      // await tx.wait()
      
      setFormData({
        amount: '',
        dueDate: '',
        paymentDate: '',
        category: 'servicios',
        entityName: '',
      })
    } catch (error) {
      console.error('Error:', error)
      alert('Error al registrar el pago: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Registrar Nuevo Pago</h2>
            <p className="text-sm text-gray-500">Completa el formulario para registrar un pago</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto del Pago
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Vencimiento
            </label>
            <input
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Pago
            </label>
            <input
              type="date"
              required
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="servicios">Servicios Públicos</option>
              <option value="credito">Crédito</option>
              <option value="comercio">Comercio</option>
              <option value="otros">Otros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Entidad
            </label>
            <input
              type="text"
              required
              value={formData.entityName}
              onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="Ej: Empresa de Servicios XYZ"
            />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] disabled:scale-100 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Registrando en Blockchain...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Registrar Pago</span>
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              Esta transacción será registrada de forma permanente en la blockchain
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
