import { useState } from 'react'
import { motion } from 'framer-motion'
import { History, Filter, X, Calendar } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { OrderStatus, DateFilter } from '../types'
import { format, isWithinInterval, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import OrderCard from '../components/OrderCard'

const Historique: React.FC = () => {
  const { orders } = useApp()
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all')
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    startDate: '',
    endDate: ''
  })

  const statusLabels: Record<OrderStatus | 'all', string> = {
    all: 'Toutes',
    en_attente: 'En attente',
    validee: 'Validée',
    non_paye: 'Non payé',
    paye: 'Payé',
    expedie: 'Expédié',
    livre: 'Livré'
  }

  const filteredOrders = orders.filter(order => {
    // Exclure les commandes en attente de validation de l'historique
    if (order.status === 'en_attente') return false
    
    // Filtre par statut
    const statusMatch = selectedStatus === 'all' || order.status === selectedStatus
    
    // Filtre par date
    let dateMatch = true
    if (dateFilter.startDate && dateFilter.endDate) {
      try {
        const orderDate = parseISO(order.created_at)
        const startDate = parseISO(dateFilter.startDate)
        const endDate = parseISO(dateFilter.endDate + 'T23:59:59')
        dateMatch = isWithinInterval(orderDate, { start: startDate, end: endDate })
      } catch (error) {
        dateMatch = true
      }
    }
    
    return statusMatch && dateMatch
  })

  const sortedOrders = [...filteredOrders].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const clearDateFilter = () => {
    setDateFilter({ startDate: '', endDate: '' })
    setShowDateFilter(false)
  }

  const hasActiveFilters = dateFilter.startDate || dateFilter.endDate

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-primary-accent mb-2">Historique des commandes</h2>
        <p className="text-primary-light opacity-70">{sortedOrders.length} commande{sortedOrders.length !== 1 ? 's' : ''} {hasActiveFilters ? 'filtrée' + (sortedOrders.length !== 1 ? 's' : '') : 'au total'}</p>
      </motion.div>

      {/* Filtres par statut */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4"
      >
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              showDateFilter || hasActiveFilters ? 'bg-primary-accent text-primary-dark' : 'bg-primary-light bg-opacity-10 text-primary-light hover:bg-opacity-20'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filtrer par date</span>
            {hasActiveFilters && <span className="bg-primary-dark bg-opacity-30 px-2 py-0.5 rounded-full text-xs">Actif</span>}
          </button>
          {(Object.keys(statusLabels) as (OrderStatus | 'all')[]).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedStatus === status
                  ? 'bg-primary-accent text-primary-dark'
                  : 'bg-primary-light bg-opacity-10 text-primary-light hover:bg-opacity-20'
              }`}
            >
              {statusLabels[status]} ({status === 'all' ? orders.length : orders.filter(o => o.status === status).length})
            </button>
          ))}
        </div>
      </motion.div>

      {/* Filtre par date */}
      {showDateFilter && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-primary-light flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Filtrer par période</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearDateFilter}
                className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="h-4 w-4" />
                <span className="text-sm">Effacer</span>
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                Date de début:
              </label>
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                className="input-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                Date de fin:
              </label>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                className="input-primary"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Liste des commandes */}
      {sortedOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <History className="h-16 w-16 text-primary-light opacity-30 mx-auto mb-4" />
          <p className="text-primary-light opacity-70">
            {selectedStatus === 'all' && !hasActiveFilters
              ? 'Aucune commande pour le moment'
              : 'Aucune commande ne correspond aux filtres sélectionnés'
            }
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {sortedOrders.map((order, index) => (
            <OrderCard key={order.id} order={order} delay={index * 0.1} />
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default Historique