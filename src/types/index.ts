export interface Product {
  id: string
  name: string
  description: string
  image?: string
  weight: number
  purchase_price?: number
  sale_price: number
  variants?: ProductVariant[]
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: string
  name: string
  sale_price: number
  purchase_price?: number
  weight_modifier: number
}

export interface CartItem {
  product: Product
  variant?: ProductVariant
  quantity: number
  unit_price: number
  unit_purchase_price?: number
  unit_weight: number
}

export interface DeliveryRule {
  id: string
  delivery_mode: DeliveryMode
  min_weight: number
  max_weight: number
  price: number
  created_at: string
  updated_at: string
}

export type OrderStatus = 'en_attente' | 'validee' | 'non_paye' | 'paye' | 'expedie' | 'livre'

export type PaymentMethod = 'virement' | 'carte_bleue' | 'lien_paiement' | 'espece'

export interface Order {
  id: string
  client?: Client
  items: CartItem[]
  delivery_mode: DeliveryMode
  delivery_fee: number
  total_weight: number
  subtotal: number
  vat_rate: number
  vat_amount: number
  total: number
  status: OrderStatus
  payment_method?: PaymentMethod
  notes?: string
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  products_with_purchase_price: number
  products_without_purchase_price: number
  delivery_revenue_by_mode: Record<DeliveryMode, number>
  total_profit: number
  total_vat_collected: number
  orders_by_status: Record<OrderStatus, { count: number; value: number }>
  orders_by_payment_method: Record<PaymentMethod, { count: number; value: number }>
  orders_by_delivery_mode: Record<DeliveryMode, { count: number; value: number }>
}

export type DeliveryMode = 'colissimo' | 'gls'

export interface DateFilter {
  startDate: string
  endDate: string
}

export type DashboardPeriod = 'all' | 'current_month' | 'current_year' | 'custom'

export interface DashboardFilter {
  period: DashboardPeriod
  customStartDate?: string
  customEndDate?: string
}