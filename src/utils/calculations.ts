import { CartItem, DeliveryRule, DeliveryMode } from '../types'

export const calculateDeliveryFee = (totalWeight: number, deliveryRules: DeliveryRule[], deliveryMode: DeliveryMode): number => {
  const rule = deliveryRules.find(rule => 
    totalWeight >= rule.min_weight && totalWeight < rule.max_weight && rule.delivery_mode === deliveryMode
  )
  return rule?.price || 0
}

export const calculateOrderTotals = (cart: CartItem[], deliveryRules: DeliveryRule[], deliveryMode: DeliveryMode, vatRate: number = 0) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
  const totalWeight = cart.reduce((sum, item) => sum + (item.unit_weight * item.quantity), 0)
  const deliveryFee = calculateDeliveryFee(totalWeight, deliveryRules, deliveryMode)
  const vatAmount = subtotal * (vatRate / 100)
  const total = subtotal + deliveryFee + vatAmount
  
  return {
    subtotal,
    totalWeight,
    deliveryMode,
    deliveryFee,
    vatRate,
    vatAmount,
    total
  }
}

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

export const formatWeight = (weight: number): string => {
  return `${weight.toFixed(2)} kg`
}