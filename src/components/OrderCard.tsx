import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Package, MessageSquare, ChevronDown, ChevronUp, CreditCard, Users, Truck } from 'lucide-react'
import { Order, OrderStatus, PaymentMethod, DeliveryMode } from '../types'
import { useApp } from '../contexts/AppContext'
import { formatPrice, formatWeight } from '../utils/calculations'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface OrderCardProps {
  order: Order
  delay?: number
}

const OrderCard: React.FC<OrderCardProps> = ({ order, delay = 0 }) => {
  const { updateOrderStatus } = useApp()
  const [expanded, setExpanded] = useState(false)

  const statusLabels: Record<OrderStatus, string> = {
    en_attente: 'En attente',
    validee: 'Validée',
    non_paye: 'Non payé',
    paye: 'Payé',
    expedie: 'Expédié',
    livre: 'Livré'
  }

  const statusColors: Record<OrderStatus, string> = {
    en_attente: 'bg-orange-500 bg-opacity-20 text-orange-400 border-orange-500',
    validee: 'bg-blue-500 bg-opacity-20 text-blue-400 border-blue-500',
    non_paye: 'status-non-paye',
    paye: 'status-paye',
    expedie: 'status-expedie',
    livre: 'status-livre'
  }

  const paymentMethodLabels: Record<PaymentMethod, string> = {
    virement: 'Virement',
    carte_bleue: 'Carte Bleue',
    lien_paiement: 'Lien de paiement',
    espece: 'Espèce'
  }

  const paymentMethodColors: Record<PaymentMethod, string> = {
    virement: 'text-primary-secondary',
    carte_bleue: 'text-primary-accent',
    lien_paiement: 'text-primary-tertiary',
    espece: 'text-green-400'
  }

  const deliveryModeLabels: Record<DeliveryMode, string> = {
    colissimo: 'Colissimo',
    gls: 'GLS'
  }

  const deliveryModeColors: Record<DeliveryMode, string> = {
    colissimo: 'text-primary-secondary',
    gls: 'text-primary-tertiary'
  }

  const handleStatusChange = (newStatus: OrderStatus) => {
    updateOrderStatus(order.id, newStatus, order.payment_method)
  }

  const handlePaymentMethodChange = (newPaymentMethod: PaymentMethod) => {
    updateOrderStatus(order.id, order.status, newPaymentMethod)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card overflow-hidden"
    >
      {/* En-tête de commande */}
      <div className="p-4 border-b border-primary-light border-opacity-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-primary-light opacity-50" />
            <span className="text-sm text-primary-light opacity-70">
              {format(new Date(order.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="font-bold text-primary-accent">{formatPrice(order.total)}</span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 text-primary-light opacity-50 hover:opacity-100 transition-opacity"
            >
              {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Package className="h-5 w-5 text-primary-light opacity-50" />
            <span className="text-sm text-primary-light opacity-70">
              {order.items.length} article{order.items.length !== 1 ? 's' : ''} • {formatWeight(order.total_weight)}
            </span>
            {order.client && (
              <>
                <span className="text-primary-light opacity-30">•</span>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-primary-light opacity-50" />
                  <span className="text-sm text-primary-accent font-medium">
                    {order.client.name}
                  </span>
                </div>
              </>
            )}
            {order.payment_method && (
              <>
                <span className="text-primary-light opacity-30">•</span>
                <div className="flex items-center space-x-1">
                  <CreditCard className="h-4 w-4 text-primary-light opacity-50" />
                  <span className={`text-sm font-medium ${paymentMethodColors[order.payment_method]}`}>
                    {paymentMethodLabels[order.payment_method]}
                  </span>
                </div>
              </>
            )}
            <span className="text-primary-light opacity-30">•</span>
            <div className="flex items-center space-x-1">
              <Truck className="h-4 w-4 text-primary-light opacity-50" />
              <span className={`text-sm font-medium ${deliveryModeColors[order.delivery_mode]}`}>
                {deliveryModeLabels[order.delivery_mode]}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              className={`px-3 py-1 rounded-lg border text-sm font-medium transition-all duration-200 ${statusColors[order.status]}`}
            >
              {(Object.keys(statusLabels) as OrderStatus[]).map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Détails expandables */}
      {expanded && (
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
            {/* Mode de paiement */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                Mode de paiement:
              </label>
              <select
                value={order.payment_method || ''}
                onChange={(e) => handlePaymentMethodChange(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-primary-light bg-opacity-10 border border-primary-light border-opacity-30 rounded-lg text-primary-light focus:border-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent focus:ring-opacity-30 transition-all duration-200"
              >
                <option value="">Sélectionner un mode de paiement</option>
                {(Object.keys(paymentMethodLabels) as PaymentMethod[]).map((method) => (
                  <option key={method} value={method}>
                    {paymentMethodLabels[method]}
                  </option>
                ))}
              </select>
            </div>

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
  )
}

export default OrderCard