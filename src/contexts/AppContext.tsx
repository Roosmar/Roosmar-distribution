import { createContext, useContext, useReducer, useEffect } from 'react'
import { Product, Order, DeliveryRule, CartItem, OrderStatus, PaymentMethod, Client, DeliveryMode } from '../types'
import { loadFromStorage, saveToStorage } from '../utils/storage'
import { calculateDeliveryFee, calculateOrderTotals } from '../utils/calculations'
import toast from 'react-hot-toast'

interface AppState {
  products: Product[]
  clients: Client[]
  orders: Order[]
  deliveryRules: DeliveryRule[]
  cart: CartItem[]
  selectedClient: Client | null
  selectedDeliveryMode: DeliveryMode
  vatEnabled: boolean
  vatRate: number
  currentOrder: Order | null
  loading: boolean
}

type AppAction =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_CLIENTS'; payload: Client[] }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'SET_DELIVERY_RULES'; payload: DeliveryRule[] }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'UPDATE_CART_ITEM'; payload: { index: number; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_SELECTED_CLIENT'; payload: Client | null }
  | { type: 'SET_SELECTED_DELIVERY_MODE'; payload: DeliveryMode }
  | { type: 'SET_VAT_ENABLED'; payload: boolean }
  | { type: 'SET_VAT_RATE'; payload: number }
  | { type: 'SET_CURRENT_ORDER'; payload: Order | null }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { id: string; status: OrderStatus; payment_method?: PaymentMethod } }
  | { type: 'SET_LOADING'; payload: boolean }

const initialState: AppState = {
  products: [],
  clients: [],
  orders: [],
  deliveryRules: [
    { id: '1', delivery_mode: 'colissimo', min_weight: 0, max_weight: 5, price: 5, created_at: '', updated_at: '' },
    { id: '2', delivery_mode: 'colissimo', min_weight: 5, max_weight: 10, price: 8, created_at: '', updated_at: '' },
    { id: '3', delivery_mode: 'colissimo', min_weight: 10, max_weight: 20, price: 12, created_at: '', updated_at: '' },
    { id: '4', delivery_mode: 'colissimo', min_weight: 20, max_weight: 999, price: 18, created_at: '', updated_at: '' },
    { id: '5', delivery_mode: 'gls', min_weight: 0, max_weight: 5, price: 6, created_at: '', updated_at: '' },
    { id: '6', delivery_mode: 'gls', min_weight: 5, max_weight: 10, price: 9, created_at: '', updated_at: '' },
    { id: '7', delivery_mode: 'gls', min_weight: 10, max_weight: 20, price: 14, created_at: '', updated_at: '' },
    { id: '8', delivery_mode: 'gls', min_weight: 20, max_weight: 999, price: 20, created_at: '', updated_at: '' }
  ],
  cart: [],
  selectedClient: null,
  selectedDeliveryMode: 'colissimo',
  vatEnabled: false,
  vatRate: 20,
  currentOrder: null,
  loading: false
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload }
    case 'SET_CLIENTS':
      return { ...state, clients: action.payload }
    case 'SET_ORDERS':
      return { ...state, orders: action.payload }
    case 'SET_DELIVERY_RULES':
      return { ...state, deliveryRules: action.payload }
    case 'ADD_TO_CART':
      return { ...state, cart: [...state.cart, action.payload] }
    case 'UPDATE_CART_ITEM':
      return {
        ...state,
        cart: state.cart.map((item, index) =>
          index === action.payload.index
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter((_, index) => index !== action.payload)
      }
    case 'CLEAR_CART':
      return { ...state, cart: [], selectedClient: null, selectedDeliveryMode: 'colissimo' }
    case 'SET_SELECTED_CLIENT':
      return { ...state, selectedClient: action.payload }
    case 'SET_SELECTED_DELIVERY_MODE':
      return { ...state, selectedDeliveryMode: action.payload }
    case 'SET_VAT_ENABLED':
      return { ...state, vatEnabled: action.payload }
    case 'SET_VAT_RATE':
      return { ...state, vatRate: action.payload }
    case 'SET_CURRENT_ORDER':
      return { ...state, currentOrder: action.payload }
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.id
            ? { 
                ...order, 
                status: action.payload.status, 
                payment_method: action.payload.payment_method || order.payment_method,
                updated_at: new Date().toISOString() 
              }
            : order
        )
      }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

interface AppContextValue extends AppState {
  dispatch: React.Dispatch<AppAction>
  addToCart: (product: Product, variant?: any, quantity?: number) => void
  updateCartItem: (index: number, quantity: number) => void
  removeFromCart: (index: number) => void
  clearCart: () => void
  setSelectedClient: (client: Client | null) => void
  setSelectedDeliveryMode: (mode: DeliveryMode) => void
  setVatEnabled: (enabled: boolean) => void
  setVatRate: (rate: number) => void
  createOrder: (notes?: string) => Promise<void>
  updateOrderStatus: (orderId: string, status: OrderStatus, paymentMethod?: PaymentMethod) => Promise<void>
  updateDeliveryRules: (rules: DeliveryRule[]) => Promise<void>
  getCurrentOrderTotals: () => any
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  addClient: (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateClient: (id: string, client: Partial<Client>) => Promise<void>
  deleteClient: (id: string) => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  // Auto-save to localStorage
  useEffect(() => {
    saveToStorage('roosmar_products', state.products)
  }, [state.products])

  useEffect(() => {
    saveToStorage('roosmar_clients', state.clients)
  }, [state.clients])

  useEffect(() => {
    saveToStorage('roosmar_orders', state.orders)
  }, [state.orders])

  useEffect(() => {
    saveToStorage('roosmar_delivery_rules', state.deliveryRules)
  }, [state.deliveryRules])

  useEffect(() => {
    saveToStorage('roosmar_vat_settings', { enabled: state.vatEnabled, rate: state.vatRate })
  }, [state.vatEnabled, state.vatRate])

  const loadInitialData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      // Load from localStorage first
      const localProducts = loadFromStorage('roosmar_products', [])
      const localClients = loadFromStorage('roosmar_clients', [])
      const localOrders = loadFromStorage('roosmar_orders', [])
      const localRules = loadFromStorage('roosmar_delivery_rules', initialState.deliveryRules)
      const vatSettings = loadFromStorage('roosmar_vat_settings', { enabled: false, rate: 20 })

      if (localProducts.length === 0) {
        // Initialize with sample products
        const sampleProducts: Product[] = [
          {
            id: '1',
            name: 'Café Premium Bio',
            description: 'Café arabica premium issu de l\'agriculture biologique',
            image: 'https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=400',
            weight: 0.5,
            purchase_price: 8.50,
            sale_price: 15.90,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Thé Vert Sencha',
            description: 'Thé vert japonais de qualité supérieure',
            image: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=400',
            weight: 0.1,
            purchase_price: 12.00,
            sale_price: 24.90,
            variants: [
              { id: 'v1', name: '100g', sale_price: 24.90, purchase_price: 12.00, weight_modifier: 1 },
              { id: 'v2', name: '200g', sale_price: 45.90, purchase_price: 22.00, weight_modifier: 2 }
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Miel de Lavande',
            description: 'Miel artisanal de lavande de Provence',
            image: 'https://images.pexels.com/photos/1638814/pexels-photo-1638814.jpeg?auto=compress&cs=tinysrgb&w=400',
            weight: 0.25,
            sale_price: 12.50,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        dispatch({ type: 'SET_PRODUCTS', payload: sampleProducts })
      } else {
        dispatch({ type: 'SET_PRODUCTS', payload: localProducts })
      }

      if (localClients.length === 0) {
        // Initialize with sample clients
        const sampleClients: Client[] = [
          {
            id: '1',
            name: 'Marie Dupont',
            email: 'marie.dupont@email.com',
            phone: '06 12 34 56 78',
            address: '123 Rue de la Paix',
            city: 'Paris',
            postal_code: '75001',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Jean Martin',
            email: 'jean.martin@email.com',
            phone: '06 98 76 54 32',
            address: '456 Avenue des Champs',
            city: 'Lyon',
            postal_code: '69000',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        dispatch({ type: 'SET_CLIENTS', payload: sampleClients })
      } else {
        dispatch({ type: 'SET_CLIENTS', payload: localClients })
      }

      dispatch({ type: 'SET_ORDERS', payload: localOrders })
      dispatch({ type: 'SET_DELIVERY_RULES', payload: localRules })
      dispatch({ type: 'SET_VAT_ENABLED', payload: vatSettings.enabled })
      dispatch({ type: 'SET_VAT_RATE', payload: vatSettings.rate })

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const addToCart = (product: Product, variant?: any, quantity: number = 1) => {
    const effectivePrice = variant?.sale_price || product.sale_price
    const effectivePurchasePrice = variant?.purchase_price || product.purchase_price
    const effectiveWeight = variant 
      ? product.weight * variant.weight_modifier 
      : product.weight

    const cartItem: CartItem = {
      product,
      variant,
      quantity,
      unit_price: effectivePrice,
      unit_purchase_price: effectivePurchasePrice,
      unit_weight: effectiveWeight
    }

    dispatch({ type: 'ADD_TO_CART', payload: cartItem })
    toast.success('Produit ajouté au panier')
  }

  const updateCartItem = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index)
      return
    }
    dispatch({ type: 'UPDATE_CART_ITEM', payload: { index, quantity } })
  }

  const removeFromCart = (index: number) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: index })
    toast.success('Produit retiré du panier')
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
    toast.success('Panier vidé')
  }

  const setSelectedClient = (client: Client | null) => {
    dispatch({ type: 'SET_SELECTED_CLIENT', payload: client })
  }

  const setSelectedDeliveryMode = (mode: DeliveryMode) => {
    dispatch({ type: 'SET_SELECTED_DELIVERY_MODE', payload: mode })
  }

  const setVatEnabled = (enabled: boolean) => {
    dispatch({ type: 'SET_VAT_ENABLED', payload: enabled })
  }

  const setVatRate = (rate: number) => {
    dispatch({ type: 'SET_VAT_RATE', payload: rate })
  }

  const getCurrentOrderTotals = () => {
    const vatRate = state.vatEnabled ? state.vatRate : 0
    return calculateOrderTotals(state.cart, state.deliveryRules, state.selectedDeliveryMode, vatRate)
  }

  const createOrder = async (notes?: string) => {
    if (state.cart.length === 0) {
      toast.error('Le panier est vide')
      return
    }

    const totals = getCurrentOrderTotals()
    const newOrder: Order = {
      id: Date.now().toString(),
      client: state.selectedClient || undefined,
      items: [...state.cart],
      delivery_mode: state.selectedDeliveryMode,
      delivery_fee: totals.deliveryFee,
      total_weight: totals.totalWeight,
      subtotal: totals.subtotal,
      vat_rate: totals.vatRate,
      vat_amount: totals.vatAmount,
      total: totals.total,
      status: 'en_attente',
      notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    dispatch({ type: 'SET_ORDERS', payload: [...state.orders, newOrder] })
    dispatch({ type: 'CLEAR_CART' })
    toast.success('Commande créée avec succès')
  }

  const updateOrderStatus = async (orderId: string, status: OrderStatus, paymentMethod?: PaymentMethod) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { id: orderId, status, payment_method: paymentMethod } })
    toast.success('Statut de commande mis à jour')
  }

  const updateDeliveryRules = async (rules: DeliveryRule[]) => {
    dispatch({ type: 'SET_DELIVERY_RULES', payload: rules })
    toast.success('Règles de livraison mises à jour')
  }

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    if (!productData.name || !productData.description || productData.weight <= 0 || productData.sale_price <= 0) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    dispatch({ type: 'SET_PRODUCTS', payload: [...state.products, newProduct] })
    toast.success('Produit ajouté avec succès')
  }

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    if (productData.name === '' || (productData.weight !== undefined && productData.weight <= 0) || (productData.sale_price !== undefined && productData.sale_price <= 0)) {
      toast.error('Les valeurs fournies ne sont pas valides')
      return
    }

    const updatedProducts = state.products.map(product =>
      product.id === id
        ? { ...product, ...productData, updated_at: new Date().toISOString() }
        : product
    )
    dispatch({ type: 'SET_PRODUCTS', payload: updatedProducts })
    toast.success('Produit mis à jour avec succès')
  }

  const deleteProduct = async (id: string) => {
    const updatedProducts = state.products.filter(product => product.id !== id)
    dispatch({ type: 'SET_PRODUCTS', payload: updatedProducts })
    toast.success('Produit supprimé avec succès')
  }

  const addClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    if (!clientData.name) {
      toast.error('Le nom du client est obligatoire')
      return
    }

    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    dispatch({ type: 'SET_CLIENTS', payload: [...state.clients, newClient] })
    toast.success('Client ajouté avec succès')
  }

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    if (clientData.name === '') {
      toast.error('Le nom du client ne peut pas être vide')
      return
    }

    const updatedClients = state.clients.map(client =>
      client.id === id
        ? { ...client, ...clientData, updated_at: new Date().toISOString() }
        : client
    )
    dispatch({ type: 'SET_CLIENTS', payload: updatedClients })
    toast.success('Client mis à jour avec succès')
  }

  const deleteClient = async (id: string) => {
    const updatedClients = state.clients.filter(client => client.id !== id)
    dispatch({ type: 'SET_CLIENTS', payload: updatedClients })
    toast.success('Client supprimé avec succès')
  }

  const value: AppContextValue = {
    ...state,
    dispatch,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    setSelectedClient,
    setSelectedDeliveryMode,
    setVatEnabled,
    setVatRate,
    createOrder,
    updateOrderStatus,
    updateDeliveryRules,
    getCurrentOrderTotals,
    addProduct,
    updateProduct,
    deleteProduct,
    addClient,
    updateClient,
    deleteClient
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}