import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Package, Plus } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { Product, ProductVariant } from '../types'
import ProductCard from '../components/ProductCard'
import ProductModal from '../components/ProductModal'

const Catalogue: React.FC = () => {
  const { products, addToCart, deleteProduct } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddToCart = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    addToCart(product, variant, quantity)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowProductModal(true)
  }

  const handleDeleteProduct = async (product: Product) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
      await deleteProduct(product.id)
    }
  }

  const handleCloseModal = () => {
    setShowProductModal(false)
    setEditingProduct(null)
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
            <span>Catalogue produits</span>
            <button
              onClick={() => setShowProductModal(true)}
              className="p-2 bg-primary-accent text-primary-dark rounded-lg hover:bg-opacity-90 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
            </button>
          </h2>
          <p className="text-primary-light opacity-70">{products.length} produits disponibles</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-light opacity-50" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-primary pl-10"
          />
        </div>
      </motion.div>

      {/* Liste des produits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={(product, quantity, variant) => handleAddToCart(product, variant, quantity)}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            delay={index * 0.1}
          />
        ))}
      </motion.div>

      {filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Package className="h-16 w-16 text-primary-light opacity-30 mx-auto mb-4" />
          <p className="text-primary-light opacity-70">
            {searchTerm ? 'Aucun produit trouvé pour cette recherche' : 'Aucun produit dans le catalogue'}
          </p>
        </motion.div>
      )}

      {/* Modal d'ajout/édition de produit */}
      {showProductModal && (
        <ProductModal
          product={editingProduct}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default Catalogue