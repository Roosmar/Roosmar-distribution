import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Package, Edit, Trash2, MoreVertical, Minus } from 'lucide-react'
import { Product, ProductVariant } from '../types'
import { formatPrice, formatWeight } from '../utils/calculations'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, quantity: number, variant?: ProductVariant) => void
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  delay?: number
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onEdit, onDelete, delay = 0 }) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.[0]
  )
  const [showActions, setShowActions] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const effectivePrice = selectedVariant?.sale_price || product.sale_price
  const effectiveWeight = selectedVariant 
    ? product.weight * selectedVariant.weight_modifier 
    : product.weight

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card overflow-hidden hover:shadow-2xl transition-all duration-300 group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-primary-light bg-opacity-10 flex items-center justify-center">
            <Package className="h-12 w-12 text-primary-light opacity-30" />
          </div>
        )}
        
        {product.purchase_price && (
          <div className="absolute top-2 left-2 bg-green-500 bg-opacity-20 border border-green-500 border-opacity-30 text-green-400 px-2 py-1 rounded text-xs font-medium">
            Bénéfice: {formatPrice(effectivePrice - (selectedVariant?.purchase_price || product.purchase_price))}
          </div>
        )}
        
        {/* Actions menu */}
        {(onEdit || onDelete) && (
          <div className="absolute top-2 right-2">
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
                      onEdit(product)
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
                      onDelete(product)
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

      {/* Contenu */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-lg text-primary-light group-hover:text-primary-accent transition-colors duration-200">
            {product.name}
          </h3>
          <p className="text-sm text-primary-light opacity-60 line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Variantes */}
        {product.variants && product.variants.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-primary-light opacity-70 mb-2">
              Variantes:
            </label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                    selectedVariant?.id === variant.id
                      ? 'bg-primary-accent text-primary-dark'
                      : 'bg-primary-light bg-opacity-10 text-primary-light hover:bg-opacity-20'
                  }`}
                >
                  {variant.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Informations produit */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-primary-light opacity-70">Poids:</span>
            <span className="font-medium">{formatWeight(effectiveWeight)}</span>
          </div>
          
          {(selectedVariant?.purchase_price || product.purchase_price) && (
            <div className="flex justify-between">
              <span className="text-primary-light opacity-70">Prix d'achat:</span>
              <span className="font-medium text-primary-secondary">
                {formatPrice(selectedVariant?.purchase_price || product.purchase_price || 0)}
              </span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-primary-light opacity-70">Prix de vente:</span>
            <span className="font-bold text-primary-accent text-lg">
              {formatPrice(effectivePrice)}
            </span>
          </div>
        </div>

        {/* Sélection de quantité et ajout au panier */}
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-primary-light bg-opacity-5 p-3 rounded-lg">
            <span className="text-sm font-medium text-primary-light opacity-70">Quantité:</span>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 bg-primary-light bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all duration-200"
              >
                <Minus className="h-4 w-4" />
              </button>
              
              <div className="flex items-center">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center bg-transparent border-b border-primary-accent focus:outline-none focus:border-primary-light text-primary-light font-medium"
                />
              </div>
              
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 bg-primary-light bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              onAddToCart(product, quantity, selectedVariant)
              setQuantity(1) // Reset quantity after adding
            }}
            className="w-full btn-primary flex items-center justify-center space-x-2 group"
          >
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
            <span>Ajouter {quantity > 1 ? `${quantity} ` : ''}au panier</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard