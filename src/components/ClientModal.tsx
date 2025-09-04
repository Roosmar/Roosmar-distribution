import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Users } from 'lucide-react'
import { Client } from '../types'
import { useApp } from '../contexts/AppContext'

interface ClientModalProps {
  client?: Client | null
  onClose: () => void
}

const ClientModal: React.FC<ClientModalProps> = ({ client, onClose }) => {
  const { addClient, updateClient } = useApp()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        city: client.city || '',
        postal_code: client.postal_code || '',
        notes: client.notes || ''
      })
    }
  }, [client])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      console.error('Le nom du client est obligatoire')
      return
    }
    
    setIsSubmitting(true)

    try {
      const clientData = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        postal_code: formData.postal_code.trim() || undefined,
        notes: formData.notes.trim() || undefined
      }

      if (client) {
        await updateClient(client.id, clientData)
      } else {
        await addClient(clientData)
      }
      
      onClose()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary-accent flex items-center space-x-2">
              <Users className="h-6 w-6" />
              <span>{client ? 'Modifier le client' : 'Ajouter un client'}</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-primary-light opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-primary"
                  placeholder="Ex: Marie Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="input-primary"
                  placeholder="marie.dupont@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="input-primary"
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            {/* Adresse */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-primary-light">Adresse</h3>
              
              <div>
                <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="input-primary"
                  placeholder="123 Rue de la Paix"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                    className="input-primary"
                    placeholder="75001"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="input-primary"
                    placeholder="Paris"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="input-primary resize-none"
                rows={3}
                placeholder="Informations complémentaires sur le client..."
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-primary-light border-opacity-20">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-outline"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>{isSubmitting ? 'Sauvegarde...' : (client ? 'Modifier' : 'Ajouter')}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ClientModal