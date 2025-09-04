import { useState } from 'react'
import { motion } from 'framer-motion'
// ... autres imports

type DeliveryMode = 'colissimo' | 'gls';
import { ShoppingCart, Trash2, CreditCard, Users, X, Truck } from 'lucide-react'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Trash2, Package, CreditCard, Users, X, Truck } from 'lucide-react'
 fd40efa57fae168eda7afa1ae0bc673bca9ee8ec
import { useApp } from '../contexts/AppContext'
import { formatPrice, formatWeight } from '../utils/calculations'
import CartItem from '../components/CartItem'

const Commandes: React.FC = () => {
  const { cart, clearCart, createOrder, getCurrentOrderTotals, clients, selectedClient, setSelectedClient, selectedDeliveryMode, setSelectedDeliveryMode, vatEnabled, vatRate, setVatEnabled, setVatRate } = useApp()
  const deliveryMode = selectedDeliveryMode as DeliveryMode;
  const [isCreating, setIsCreating] = useState(false)

  const totals = getCurrentOrderTotals()

  const deliveryModeLabels = {
    colissimo: 'Colissimo',
    gls: 'GLS'
  }

  const deliveryModeColors = {
    colissimo: 'bg-primary-secondary bg-opacity-20 text-primary-secondary border-primary-secondary',
    gls: 'bg-primary-tertiary bg-opacity-20 text-primary-tertiary border-primary-tertiary'
  }

  const handleCreateOrder = async () => {
    setIsCreating(true)
    try {
      await createOrder(notes || undefined)
      setNotes('')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-primary-accent mb-2">Commande en cours</h2>
        <p className="text-primary-light opacity-70">
          {cart.length} article{cart.length !== 1 ? 's' : ''} dans le panier
        </p>
      </motion.div>

      {cart.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <ShoppingCart className="h-16 w-16 text-primary-light opacity-30 mx-auto mb-4" />
          <p className="text-primary-light opacity-70 mb-6">Le panier est vide</p>
          <p className="text-sm text-primary-light opacity-50">
            Ajoutez des produits depuis le catalogue pour créer une commande
          </p>
        </motion.div>
      ) : (
        <>
          {/* Configuration TVA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-4"
          >
            <h3 className="font-medium text-primary-light flex items-center space-x-2 mb-3">
              <CreditCard className="h-5 w-5 text-primary-accent" />
              <span>Configuration TVA</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="vat-enabled"
                  checked={vatEnabled}
                  onChange={(e) => setVatEnabled(e.target.checked)}
                  className="w-5 h-5 text-primary-accent bg-primary-light bg-opacity-10 border-primary-light border-opacity-30 rounded focus:ring-primary-accent focus:ring-2"
                />
                <label htmlFor="vat-enabled" className="text-primary-light">
                  Appliquer la TVA
                </label>
              </div>
              
              {vatEnabled && (
                <div className="flex items-center space-x-3">
                  <label className="text-sm text-primary-light opacity-70 min-w-[80px]">
                    Taux TVA:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={vatRate}
                      onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                      className="w-20 px-3 py-2 bg-primary-light bg-opacity-10 border border-primary-light border-opacity-30 rounded-lg text-primary-light focus:border-primary-accent focus:outline-none focus:ring-2 focus:ring-primary-accent focus:ring-opacity-30 transition-all duration-200"
                    />
                    <span className="text-primary-light opacity-70">%</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Articles du panier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {cart.map((item, index) => (
              <CartItem key={index} item={item} index={index} />
            ))}
          </motion.div>

          {/* Sélection du client */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-primary-light flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary-accent" />
                <span>Client (optionnel)</span>
              </h3>
              {selectedClient && (
                <button
                  onClick={() => setSelectedClient(null)}
                  className="p-1 text-red-400 hover:bg-red-500 hover:bg-opacity-20 rounded transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {selectedClient ? (
              <div className="bg-primary-accent bg-opacity-10 border border-primary-accent border-opacity-30 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-accent bg-opacity-20 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-primary-accent">{selectedClient.name}</p>
                    {selectedClient.city && (
                      <p className="text-xs text-primary-light opacity-60">{selectedClient.city}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <select
                value=""
                onChange={(e) => {
                  const client = clients.find(c => c.id === e.target.value)
                  setSelectedClient(client || null)
                }}
                className="input-primary"
              >
                <option value="">Sélectionner un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.city && `- ${client.city}`}
                  </option>
                ))}
              </select>
            )}
          </motion.div>

          {/* Sélection du mode de livraison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-4"
          >
            <h3 className="font-medium text-primary-light flex items-center space-x-2 mb-3">
              <Truck className="h-5 w-5 text-primary-accent" />
              <span>Mode de livraison</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(deliveryModeLabels) as Array<keyof typeof deliveryModeLabels>).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedDeliveryMode(mode)}
                  className={`p-3 rounded-lg border-2 font-medium transition-all duration-200 ${
                    selectedDeliveryMode === mode
                      ? deliveryModeColors[mode]
                      : 'bg-primary-light bg-opacity-10 text-primary-light border-primary-light border-opacity-20 hover:bg-opacity-20'
                  }`}
                >
                  {deliveryModeLabels[mode]}
                </button>
              ))}
            </div>
            
            <div className="mt-3 text-sm text-primary-light opacity-60">
              Mode sélectionné: <span className="font-medium text-primary-accent">{deliveryModeLabels[selectedDeliveryMode]}</span>
            </div>
          </motion.div>
          {/* Résumé de la commande */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
            className="card p-6 space-y-4"
          >
            <h3 className="text-xl font-bold text-primary-accent mb-4">Résumé de la commande</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-primary-light opacity-70">Sous-total produits:</span>
                <span className="font-medium">{formatPrice(totals.subtotal)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-primary-light opacity-70">
                  Poids total: {formatWeight(totals.totalWeight)}
                </span>
              </div>
              
              <div className="flex justify-between items-center border-t border-primary-light border-opacity-20 pt-2">
                <span className="text-primary-tertiary">Frais de livraison:</span>
                <span className="font-medium text-primary-tertiary">{formatPrice(totals.deliveryFee)}</span>
              </div>
              
              {vatEnabled && totals.vatAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-primary-secondary">TVA ({totals.vatRate}%) sur produits:</span>
                  <span className="font-medium text-primary-secondary">{formatPrice(totals.vatAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center border-t border-primary-accent border-opacity-30 pt-2">
                <span className="text-lg font-bold text-primary-accent">Total:</span>
                <span className="text-xl font-bold text-primary-accent">{formatPrice(totals.total)}</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                Notes (optionnel):
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajouter une note à cette commande..."
                rows={3}
                className="input-primary resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={clearCart}
                className="flex-1 flex items-center justify-center space-x-2 bg-red-500 bg-opacity-20 text-red-400 border-2 border-red-500 border-opacity-30 font-medium py-3 px-6 rounded-lg hover:bg-opacity-30 transition-all duration-200 active:scale-95"
              >
                <Trash2 className="h-5 w-5" />
                <span>Vider</span>
              </button>
              
              <button
                onClick={handleCreateOrder}
                disabled={isCreating}
                className="flex-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <CreditCard className="h-5 w-5" />
                <span>{isCreating ? 'Création...' : 'Créer la commande'}</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}

export default Commandes