import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Users, Plus } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { Client } from '../types'
import ClientCard from '../components/ClientCard'
import ClientModal from '../components/ClientModal'

const Clients: React.FC = () => {
  const { clients, deleteClient } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [showClientModal, setShowClientModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm)) ||
    (client.city && client.city.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setShowClientModal(true)
  }

  const handleDeleteClient = async (client: Client) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le client "${client.name}" ?`)) {
      await deleteClient(client.id)
    }
  }

  const handleCloseModal = () => {
    setShowClientModal(false)
    setEditingClient(null)
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header avec recherche */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-accent mb-2 flex items-center justify-center space-x-3">
            <span>Gestion des clients</span>
            <button
              onClick={() => setShowClientModal(true)}
              className="p-2 bg-primary-accent text-primary-dark rounded-lg hover:bg-opacity-90 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
            </button>
          </h2>
          <p className="text-primary-light opacity-70">{clients.length} client{clients.length !== 1 ? 's' : ''} enregistré{clients.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-light opacity-50" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-primary pl-10"
          />
        </div>
      </motion.div>

      {/* Liste des clients */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredClients.map((client, index) => (
          <ClientCard
            key={client.id}
            client={client}
            onEdit={handleEditClient}
            onDelete={handleDeleteClient}
            delay={index * 0.1}
          />
        ))}
      </motion.div>

      {filteredClients.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="h-16 w-16 text-primary-light opacity-30 mx-auto mb-4" />
          <p className="text-primary-light opacity-70">
            {searchTerm ? 'Aucun client trouvé pour cette recherche' : 'Aucun client enregistré'}
          </p>
        </motion.div>
      )}

      {/* Modal d'ajout/édition de client */}
      {showClientModal && (
        <ClientModal
          client={editingClient}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default Clients