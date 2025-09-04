import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Edit, Trash2, MoreVertical, Mail, Phone, MapPin } from 'lucide-react'
import { Client } from '../types'

interface ClientCardProps {
  client: Client
  onEdit?: (client: Client) => void
  onDelete?: (client: Client) => void
  delay?: number
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onEdit, onDelete, delay = 0 }) => {
  const [showActions, setShowActions] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card overflow-hidden hover:shadow-2xl transition-all duration-300 group"
    >
      {/* Header avec actions */}
      <div className="relative p-4 bg-primary-accent bg-opacity-10 border-b border-primary-accent border-opacity-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-accent bg-opacity-20 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-accent" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-primary-light group-hover:text-primary-accent transition-colors duration-200">
                {client.name}
              </h3>
              {client.city && (
                <p className="text-sm text-primary-light opacity-60">{client.city}</p>
              )}
            </div>
          </div>

          {/* Actions menu */}
          {(onEdit || onDelete) && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 bg-primary-dark bg-opacity-80 text-primary-light rounded-lg hover:bg-opacity-100 transition-all duration-200"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              
              {showActions && (
                <div className="absolute top-full right-0 mt-1 bg-primary-dark border border-primary-light border-opacity-20 rounded-lg shadow-xl z-10 min-w-[120px]">
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(client)
                        setShowActions(false)
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-primary-light hover:bg-primary-light hover:bg-opacity-10 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Modifier</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete(client)
                        setShowActions(false)
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500 hover:bg-opacity-20 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Supprimer</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4 space-y-3">
        {/* Contact */}
        {client.email && (
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-primary-secondary flex-shrink-0" />
            <span className="text-sm text-primary-light opacity-80 truncate">{client.email}</span>
          </div>
        )}

        {client.phone && (
          <div className="flex items-center space-x-3">
            <Phone className="h-4 w-4 text-primary-tertiary flex-shrink-0" />
            <span className="text-sm text-primary-light opacity-80">{client.phone}</span>
          </div>
        )}

        {/* Adresse */}
        {(client.address || client.city || client.postal_code) && (
          <div className="flex items-start space-x-3">
            <MapPin className="h-4 w-4 text-primary-accent flex-shrink-0 mt-0.5" />
            <div className="text-sm text-primary-light opacity-80">
              {client.address && <div>{client.address}</div>}
              {(client.postal_code || client.city) && (
                <div>
                  {client.postal_code && `${client.postal_code} `}
                  {client.city}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {client.notes && (
          <div className="border-t border-primary-light border-opacity-10 pt-3">
            <p className="text-xs text-primary-light opacity-60 mb-1">Notes:</p>
            <p className="text-sm text-primary-light opacity-80 line-clamp-2">{client.notes}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default ClientCard