import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, XCircle, Package, Calendar, MessageSquare, Users, Truck, CreditCard } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { DeliveryMode } from '../types'
import { formatPrice, formatWeight } from '../utils/calculations'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const CommandesAValider: React.FC = () => {
  const { orders, updateOrderStatus } = useApp()
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  // Filtrer les commandes en attente de validation
  const pendingOrders = orders.filter(order => order.status === 'en_attente')

  const deliveryModeLabels = {
    colissimo: 'Colissimo' as const,
    gls: 'GLS' as const
  }

  const deliveryModeColors: Record<DeliveryMode, string> = {
    colissimo: 'text-primary-secondary',
    gls: 'text-primary-tertiary'
  }

  const handleValidateOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'validee')
  }

  const handleRejectOrder = async (orderId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir rejeter cette commande ?')) {
      // Pour l'instant, on supprime la commande rejetée
      // Dans une vraie application, on pourrait avoir un statut "rejetee"
      console.log('Commande rejetée:', orderId)
    }
  }

  const toggleExpanded = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-primary-accent mb-2">Commandes à valider</h2>
        <p className="text-primary-light opacity-70">
          {pendingOrders.length} commande{pendingOrders.length !== 1 ? 's' : ''} en attente de validation
        </p>
      </motion.div>

      {pendingOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Clock className="h-16 w-16 text-primary-light opacity-30 mx-auto mb-4" />
          <p className="text-primary-light opacity-70">Aucune commande en attente de validation</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {pendingOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card overflow-hidden"
            >
              {/* En-tête de commande */}
              <div className="p-4 bg-orange-500 bg-opacity-10 border-b border-orange-500 border-opacity-20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 bg-opacity-20 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="font-bold text-orange-400">Commande en attente</p>
                      <p className="text-sm text-primary-light opacity-70">
                        {format(new Date(order.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-primary-accent text-xl">{formatPrice(order.total)}</span>
                    <button
                      onClick={() => toggleExpanded(order.id)}
                      className="p-2 text-primary-light opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <Package className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Package className="h-4 w-4 text-primary-light opacity-50" />
                      <span className="text-primary-light opacity-70">
                        {order.items.length} article{order.items.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <span className="text-primary-light opacity-30">•</span>
                    
                    <span className="text-primary-light opacity-70">
                      {formatWeight(order.total_weight)}
                    </span>

                    {order.client && (
                      <>
                        <span className="text-primary-light opacity-30">•</span>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-primary-light opacity-50" />
                          <span className="text-primary-accent font-medium">
                            {order.client.name}
                          </span>
                        </div>
                      </>
                    )}

                    <span className="text-primary-light opacity-30">•</span>
                    <div className="flex items-center space-x-1">
                      <Truck className="h-4 w-4 text-primary-light opacity-50" />
                      <span className={`font-medium ${deliveryModeColors[order.delivery_mode]}`}>
                        {deliveryModeLabels[order.delivery_mode]}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRejectOrder(order.id)}
                      className="px-4 py-2 bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-30 rounded-lg hover:bg-opacity-30 transition-all duration-200 flex items-center space-x-2"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Rejeter</span>
                    </button>
                    
                    <button
                      onClick={() => handleValidateOrder(order.id)}
                      className="px-4 py-2 bg-green-500 bg-opacity-20 text-green-400 border border-green-500 border-opacity-30 rounded-lg hover:bg-opacity-30 transition-all duration-200 flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Valider</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Détails expandables */}
              {expandedOrder === order.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 space-y-4"
                >
                  {/* Articles de la commande */}
                  <div>
                    <h4 className="font-medium text-primary-light mb-2">Articles commandés:</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-primary-light bg-opacity-5 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{item.product.name}</p>
                            {item.variant && (
                              <p className="text-xs text-primary-accent">{item.variant.name}</p>
                            )}
                            <p className="text-xs text-primary-light opacity-60">
                              {formatPrice(item.unit_price)} × {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPrice(item.unit_price * item.quantity)}</p>
                            <p className="text-xs text-primary-light opacity-60">
                              {formatWeight(item.unit_weight * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Informations client */}
                  {order.client && (
                    <div className="border-t border-primary-light border-opacity-10 pt-3">
                      <h4 className="font-medium text-primary-light mb-2 flex items-center space-x-2">
                        <Users className="h-4 w-4 text-primary-accent" />
                        <span>Informations client:</span>
                      </h4>
                      <div className="bg-primary-accent bg-opacity-5 p-3 rounded-lg space-y-1">
                        <p className="font-medium text-primary-accent">{order.client.name}</p>
                        {order.client.email && (
                          <p className="text-sm text-primary-light opacity-70">{order.client.email}</p>
                        )}
                        {order.client.phone && (
                          <p className="text-sm text-primary-light opacity-70">{order.client.phone}</p>
                        )}
                        {(order.client.address || order.client.city) && (
                          <div className="text-sm text-primary-light opacity-70">
                            {order.client.address && <div>{order.client.address}</div>}
                            {(order.client.postal_code || order.client.city) && (
                              <div>
                                {order.client.postal_code && `${order.client.postal_code} `}
                                {order.client.city}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Totaux */}
                  <div className="space-y-2 border-t border-primary-light border-opacity-10 pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-primary-light opacity-70">Sous-total:</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-primary-light opacity-70">Frais de livraison:</span>
                      <span className="text-primary-tertiary">{formatPrice(order.delivery_fee)}</span>
                    </div>
                    {order.vat_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-primary-light opacity-70">TVA ({order.vat_rate}%) sur produits:</span>
                        <span className="text-primary-secondary">{formatPrice(order.vat_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-primary-accent border-t border-primary-accent border-opacity-30 pt-2">
                      <span>Total:</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="border-t border-primary-light border-opacity-10 pt-3">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="h-4 w-4 text-primary-light opacity-50 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-primary-light opacity-70 mb-1">Notes:</p>
                          <p className="text-sm text-primary-light opacity-80">{order.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default CommandesAValider