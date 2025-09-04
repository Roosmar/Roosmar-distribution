import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Plus, Trash2, Package } from 'lucide-react'
import { Product, ProductVariant } from '../types'
import { useApp } from '../contexts/AppContext'
import { formatPrice } from '../utils/calculations'

interface ProductModalProps {
  product?: Product | null
  onClose: () => void
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addProduct, updateProduct } = useApp()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    weight: 0,
    purchase_price: 0,
    sale_price: 0
  })
  const [variants, setVariants] = useState<Omit<ProductVariant, 'id'>[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        image: product.image || '',
        weight: product.weight,
        purchase_price: product.purchase_price || 0,
        sale_price: product.sale_price
      })
      setVariants(product.variants?.map(v => ({
        name: v.name,
        sale_price: v.sale_price,
        purchase_price: v.purchase_price,
        weight_modifier: v.weight_modifier
      })) || [])
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description || formData.weight <= 0 || formData.sale_price <= 0) {
      console.error('Tous les champs obligatoires doivent être remplis')
      return
    }
    
    setIsSubmitting(true)

    try {
      const productData = {
        ...formData,
        image: formData.image || undefined,
        purchase_price: formData.purchase_price || undefined,
        variants: variants.length > 0 ? variants.map((v, index) => ({
          ...v,
          id: `v${index + 1}`,
          purchase_price: v.purchase_price || undefined
        })) : undefined
      }

      if (product) {
        await updateProduct(product.id, productData)
      } else {
        await addProduct(productData)
      }
      
      onClose()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addVariant = () => {
    setVariants([...variants, {
      name: '',
      sale_price: formData.sale_price,
      purchase_price: formData.purchase_price,
      weight_modifier: 1
    }])
  }

  const updateVariant = (index: number, field: keyof Omit<ProductVariant, 'id'>, value: string | number) => {
    const updatedVariants = [...variants]
    updatedVariants[index] = { ...updatedVariants[index], [field]: value }
    setVariants(updatedVariants)
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
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
              <Package className="h-6 w-6" />
              <span>{product ? 'Modifier le produit' : 'Ajouter un produit'}</span>
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
              <div>
                <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-primary"
                  placeholder="Ex: Café Premium Bio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                  Poids (kg) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  className="input-primary"
                  placeholder="0.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="input-primary resize-none"
                rows={3}
                placeholder="Description du produit..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                URL de l'image
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                className="input-primary"
                placeholder="https://images.pexels.com/..."
              />
            </div>

            {/* Prix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                  Prix d'achat (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchase_price: parseFloat(e.target.value) || 0 }))}
                  className="input-primary"
                  placeholder="8.50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                  Prix de vente (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.sale_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, sale_price: parseFloat(e.target.value) || 0 }))}
                  className="input-primary"
                  placeholder="15.90"
                />
              </div>
            </div>

            {/* Variantes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-primary-light">Variantes (optionnel)</h3>
                <button
                  type="button"
                  onClick={addVariant}
                  className="btn-secondary flex items-center space-x-2 text-sm py-2 px-4"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter une variante</span>
                </button>
              </div>

              {variants.map((variant, index) => (
                <div key={index} className="bg-primary-light bg-opacity-5 p-4 rounded-lg border border-primary-light border-opacity-10">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                        Nom de la variante
                      </label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                        className="input-primary"
                        placeholder="100g"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                        Prix de vente (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={variant.sale_price}
                        onChange={(e) => updateVariant(index, 'sale_price', parseFloat(e.target.value) || 0)}
                        className="input-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                        Prix d'achat (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={variant.purchase_price || 0}
                        onChange={(e) => updateVariant(index, 'purchase_price', parseFloat(e.target.value) || 0)}
                        className="input-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                        Multiplicateur poids
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={variant.weight_modifier}
                          onChange={(e) => updateVariant(index, 'weight_modifier', parseFloat(e.target.value) || 1)}
                          className="input-primary flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="p-2 text-red-400 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-primary-light opacity-60">
                    Poids effectif: {(formData.weight * variant.weight_modifier).toFixed(2)} kg
                    {variant.purchase_price && variant.sale_price && (
                      <span className="ml-4">
                        Bénéfice: {formatPrice(variant.sale_price - variant.purchase_price)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
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
                <span>{isSubmitting ? 'Sauvegarde...' : (product ? 'Modifier' : 'Ajouter')}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ProductModal