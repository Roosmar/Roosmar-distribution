import { motion } from 'framer-motion'
import { Plus, Minus, Trash2, Package } from 'lucide-react'
import { CartItem as CartItemType } from '../types'
import { useApp } from '../contexts/AppContext'
import { formatPrice, formatWeight } from '../utils/calculations'

interface CartItemProps {
  item: CartItemType
  index: number
}

const CartItem: React.FC<CartItemProps> = ({ item, index }) => {
  const { updateCartItem, removeFromCart } = useApp()

  const totalPrice = item.unit_price * item.quantity
  const totalWeight = item.unit_weight * item.quantity

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="card p-4"
    >
      <div className="flex items-start space-x-4">
        {/* Image produit */}
        <div className="flex-shrink-0">
          {item.product.image ? (
            <img
              src={item.product.image}
              alt={item.product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
          ) : (
            <div className="w-16 h-16 bg-primary-light bg-opacity-10 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-primary-light opacity-30" />
            </div>
          )}
        </div>

        {/* Détails produit */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-medium text-primary-light truncate">{item.product.name}</h4>
              {item.variant && (
                <p className="text-sm text-primary-accent">{item.variant.name}</p>
              )}
            </div>
            <button
              onClick={() => removeFromCart(index)}
              className="p-2 text-red-400 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex justify-between items-center mb-3">
            <div className="text-sm space-y-1">
              <p className="text-primary-light opacity-70">
                {formatPrice(item.unit_price)} × {item.quantity} = {formatPrice(totalPrice)}
              </p>
              <p className="text-primary-light opacity-70">
                Poids: {formatWeight(totalWeight)}
              </p>
            </div>
            
            <div className="font-bold text-primary-accent">
              {formatPrice(totalPrice)}
            </div>
          </div>

          {/* Contrôles quantité */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => updateCartItem(index, Math.max(1, item.quantity - 1))}
              className="p-2 bg-primary-light bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all duration-200"
            >
              <Minus className="h-4 w-4" />
            </button>
            
            <div className="flex-1 text-center">
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateCartItem(index, parseInt(e.target.value) || 1)}
                className="w-16 text-center bg-transparent border-b border-primary-accent focus:outline-none focus:border-primary-light"
              />
            </div>
            
            <button
              onClick={() => updateCartItem(index, item.quantity + 1)}
              className="p-2 bg-primary-light bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CartItem