import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Package, Truck, CreditCard, PieChart, Calendar, Filter, X } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { formatPrice } from '../utils/calculations'
import { OrderStatus, PaymentMethod, DashboardPeriod, DashboardFilter, DeliveryMode } from '../types'
import { isWithinInterval, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO, format } from 'date-fns'
import { fr } from 'date-fns/locale'

const Dashboard: React.FC = () => {
  const { orders, products } = useApp()
  const [filter, setFilter] = useState<DashboardFilter>({ period: 'all' })
  const [showCustomFilter, setShowCustomFilter] = useState(false)

  const stats = useMemo(() => {
    // Filtrer les commandes selon la période sélectionnée
    const filteredOrders = orders.filter(order => {
      const orderDate = parseISO(order.created_at)
      const now = new Date()
      
      switch (filter.period) {
        case 'current_month':
          return isWithinInterval(orderDate, {
            start: startOfMonth(now),
            end: endOfMonth(now)
          })
        case 'current_year':
          return isWithinInterval(orderDate, {
            start: startOfYear(now),
            end: endOfYear(now)
          })
        case 'custom':
          if (filter.customStartDate && filter.customEndDate) {
            try {
              const startDate = parseISO(filter.customStartDate)
              const endDate = parseISO(filter.customEndDate + 'T23:59:59')
              return isWithinInterval(orderDate, { start: startDate, end: endDate })
            } catch {
              return true
            }
          }
          return true
        default:
          return true
      }
    })

    let productsWithPurchasePrice = 0
    let productsWithoutPurchasePrice = 0
    const deliveryRevenueByMode: Record<DeliveryMode, number> = {
      colissimo: 0,
      gls: 0
    }
    let totalProfit = 0
    let totalVatCollected = 0
    const ordersByStatus: Record<OrderStatus, { count: number; value: number }> = {
      en_attente: { count: 0, value: 0 },
      validee: { count: 0, value: 0 },
      non_paye: { count: 0, value: 0 },
      paye: { count: 0, value: 0 },
      expedie: { count: 0, value: 0 },
      livre: { count: 0, value: 0 }
    }
    const ordersByPaymentMethod: Record<PaymentMethod, { count: number; value: number }> = {
      virement: { count: 0, value: 0 },
      carte_bleue: { count: 0, value: 0 },
      lien_paiement: { count: 0, value: 0 },
      espece: { count: 0, value: 0 }
    }
    const ordersByDeliveryMode: Record<DeliveryMode, { count: number; value: number }> = {
      colissimo: { count: 0, value: 0 },
      gls: { count: 0, value: 0 }
    }

    filteredOrders.forEach(order => {
      // Compter par statut
      ordersByStatus[order.status].count += 1
      ordersByStatus[order.status].value += order.total

      // Compter par mode de paiement
      if (order.payment_method) {
        ordersByPaymentMethod[order.payment_method].count += 1
        ordersByPaymentMethod[order.payment_method].value += order.total
      }

      // Compter par mode de livraison
      ordersByDeliveryMode[order.delivery_mode].count += 1
      ordersByDeliveryMode[order.delivery_mode].value += order.total

      // Chiffre d'affaires livraison par mode
      deliveryRevenueByMode[order.delivery_mode] += order.delivery_fee

      // TVA collectée
      totalVatCollected += order.vat_amount
      // Chiffre d'affaires produits
      order.items.forEach(item => {
        const itemTotal = item.unit_price * item.quantity
        
        if (item.unit_purchase_price) {
          productsWithPurchasePrice += itemTotal
          totalProfit += (item.unit_price - item.unit_purchase_price) * item.quantity
        } else {
          productsWithoutPurchasePrice += itemTotal
        }
      })
    })

    return {
      products_with_purchase_price: productsWithPurchasePrice,
      products_without_purchase_price: productsWithoutPurchasePrice,
      delivery_revenue_by_mode: deliveryRevenueByMode,
      total_profit: totalProfit,
      total_vat_collected: totalVatCollected,
      orders_by_status: ordersByStatus,
      orders_by_payment_method: ordersByPaymentMethod,
      orders_by_delivery_mode: ordersByDeliveryMode
    }
  }, [orders, filter])

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
    virement: 'bg-primary-secondary bg-opacity-20 text-primary-secondary border-primary-secondary',
    carte_bleue: 'bg-primary-accent bg-opacity-20 text-primary-accent border-primary-accent',
    lien_paiement: 'bg-primary-tertiary bg-opacity-20 text-primary-tertiary border-primary-tertiary',
    espece: 'bg-green-500 bg-opacity-20 text-green-400 border-green-500'
  }

  const deliveryModeLabels: Record<DeliveryMode, string> = {
    colissimo: 'Colissimo',
    gls: 'GLS'
  }

  const deliveryModeColors: Record<DeliveryMode, string> = {
    colissimo: 'bg-primary-secondary bg-opacity-20 text-primary-secondary border-primary-secondary',
    gls: 'bg-primary-tertiary bg-opacity-20 text-primary-tertiary border-primary-tertiary'
  }

  const periodLabels: Record<DashboardPeriod, string> = {
    all: 'Toute la période',
    current_month: 'Mois en cours',
    current_year: 'Année en cours',
    custom: 'Période personnalisée'
  }

  const handlePeriodChange = (period: DashboardPeriod) => {
    setFilter({ period })
    if (period !== 'custom') {
      setShowCustomFilter(false)
    } else {
      setShowCustomFilter(true)
    }
  }

  const clearCustomFilter = () => {
    setFilter({ period: 'all' })
    setShowCustomFilter(false)
  }

  const hasActiveFilter = filter.period !== 'all'
  const filteredOrdersCount = orders.filter(order => {
    const orderDate = parseISO(order.created_at)
    const now = new Date()
    
    switch (filter.period) {
      case 'current_month':
        return isWithinInterval(orderDate, {
          start: startOfMonth(now),
          end: endOfMonth(now)
        })
      case 'current_year':
        return isWithinInterval(orderDate, {
          start: startOfYear(now),
          end: endOfYear(now)
        })
      case 'custom':
        if (filter.customStartDate && filter.customEndDate) {
          try {
            const startDate = parseISO(filter.customStartDate)
            const endDate = parseISO(filter.customEndDate + 'T23:59:59')
            return isWithinInterval(orderDate, { start: startDate, end: endDate })
          } catch {
            return true
          }
        }
        return true
      default:
        return true
    }
  }).length

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-primary-accent mb-2">Tableau de bord</h2>
        <p className="text-primary-light opacity-70">
          Aperçu des performances de votre activité
          {hasActiveFilter && (
            <span className="ml-2 text-primary-accent">
              ({filteredOrdersCount} commande{filteredOrdersCount !== 1 ? 's' : ''} - {periodLabels[filter.period]})
            </span>
          )}
        </p>
      </motion.div>

      {/* Filtres de période */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4"
      >
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center space-x-2 mr-4">
            <Calendar className="h-5 w-5 text-primary-accent" />
            <span className="font-medium text-primary-light">Période d'analyse:</span>
          </div>
          
          {(Object.keys(periodLabels) as DashboardPeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => handlePeriodChange(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter.period === period
                  ? 'bg-primary-accent text-primary-dark'
                  : 'bg-primary-light bg-opacity-10 text-primary-light hover:bg-opacity-20'
              }`}
            >
              {periodLabels[period]}
            </button>
          ))}
          
          {hasActiveFilter && (
            <button
              onClick={clearCustomFilter}
              className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors ml-2"
            >
              <X className="h-4 w-4" />
              <span className="text-sm">Réinitialiser</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Filtre personnalisé */}
      {showCustomFilter && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-primary-light flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Période personnalisée</span>
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                Date de début:
              </label>
              <input
                type="date"
                value={filter.customStartDate || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, customStartDate: e.target.value }))}
                className="input-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                Date de fin:
              </label>
              <input
                type="date"
                value={filter.customEndDate || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, customEndDate: e.target.value }))}
                className="input-primary"
              />
            </div>
          </div>
          
          {filter.customStartDate && filter.customEndDate && (
            <div className="bg-primary-accent bg-opacity-10 border border-primary-accent border-opacity-30 p-3 rounded-lg">
              <p className="text-primary-accent text-sm">
                📊 Analyse de la période du {format(parseISO(filter.customStartDate), 'dd MMM yyyy', { locale: fr })} au {format(parseISO(filter.customEndDate), 'dd MMM yyyy', { locale: fr })}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Indicateurs principaux */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-6 gap-4"
      >
        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-accent bg-opacity-20 rounded-lg">
              <Package className="h-6 w-6 text-primary-accent" />
            </div>
            <div>
              <p className="text-sm text-primary-light opacity-70">CA Produits (avec prix achat)</p>
              <p className="text-xl font-bold text-primary-accent">{formatPrice(stats.products_with_purchase_price)}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-secondary bg-opacity-20 rounded-lg">
              <Package className="h-6 w-6 text-primary-secondary" />
            </div>
            <div>
              <p className="text-sm text-primary-light opacity-70">CA Produits (sans prix achat)</p>
              <p className="text-xl font-bold text-primary-secondary">{formatPrice(stats.products_without_purchase_price)}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-secondary bg-opacity-20 rounded-lg">
              <Truck className="h-6 w-6 text-primary-secondary" />
            </div>
            <div>
              <p className="text-sm text-primary-light opacity-70">CA Colissimo</p>
              <p className="text-xl font-bold text-primary-secondary">{formatPrice(stats.delivery_revenue_by_mode.colissimo)}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-tertiary bg-opacity-20 rounded-lg">
              <Truck className="h-6 w-6 text-primary-tertiary" />
            </div>
            <div>
              <p className="text-sm text-primary-light opacity-70">CA GLS</p>
              <p className="text-xl font-bold text-primary-tertiary">{formatPrice(stats.delivery_revenue_by_mode.gls)}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 bg-opacity-20 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-primary-light opacity-70">TVA collectée</p>
              <p className="text-xl font-bold text-blue-400">{formatPrice(stats.total_vat_collected)}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500 bg-opacity-20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-primary-light opacity-70">Bénéfice calculé</p>
              <p className="text-xl font-bold text-green-400">{formatPrice(stats.total_profit)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Synthèses par statut */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h3 className="text-xl font-bold text-primary-accent mb-4 flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Commandes par statut</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(statusLabels) as OrderStatus[]).map((status) => (
            <div
              key={status}
              className={`p-4 rounded-lg border-2 ${statusColors[status]}`}
            >
              <div className="text-center">
                <p className="text-2xl font-bold mb-1">
                  {stats.orders_by_status[status].count}
                </p>
                <p className="text-sm opacity-80 mb-2">{statusLabels[status]}</p>
                <p className="font-medium">
                  {formatPrice(stats.orders_by_status[status].value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Synthèses par mode de paiement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h3 className="text-xl font-bold text-primary-accent mb-4 flex items-center space-x-2">
          <PieChart className="h-5 w-5" />
          <span>Commandes par mode de paiement</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(paymentMethodLabels) as PaymentMethod[]).map((method) => (
            <div
              key={method}
              className={`p-4 rounded-lg border-2 ${paymentMethodColors[method]}`}
            >
              <div className="text-center">
                <p className="text-2xl font-bold mb-1">
                  {stats.orders_by_payment_method[method].count}
                </p>
                <p className="text-sm opacity-80 mb-2">{paymentMethodLabels[method]}</p>
                <p className="font-medium">
                  {formatPrice(stats.orders_by_payment_method[method].value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Synthèses par mode de livraison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h3 className="text-xl font-bold text-primary-accent mb-4 flex items-center space-x-2">
          <Truck className="h-5 w-5" />
          <span>Commandes par mode de livraison</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(deliveryModeLabels) as DeliveryMode[]).map((mode) => (
            <div
              key={mode}
              className={`p-4 rounded-lg border-2 ${deliveryModeColors[mode]}`}
            >
              <div className="text-center">
                <p className="text-2xl font-bold mb-1">
                  {stats.orders_by_delivery_mode[mode].count}
                </p>
                <p className="text-sm opacity-80 mb-2">{deliveryModeLabels[mode]}</p>
                <p className="font-medium">
                  {formatPrice(stats.orders_by_delivery_mode[mode].value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      {/* Résumé des produits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card p-6"
      >
        <h3 className="text-xl font-bold text-primary-accent mb-4">Informations produits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-primary-accent">{products.length}</p>
            <p className="text-sm text-primary-light opacity-70">Produits au catalogue</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-400">
              {products.filter(p => p.purchase_price).length}
            </p>
            <p className="text-sm text-primary-light opacity-70">Avec prix d'achat</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-orange-400">
              {products.filter(p => !p.purchase_price).length}
            </p>
            <p className="text-sm text-primary-light opacity-70">Sans prix d'achat</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard