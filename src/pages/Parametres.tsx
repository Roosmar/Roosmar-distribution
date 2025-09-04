import { useState } from 'react'
import { motion } from 'framer-motion'
import { Truck, Save, Plus, Trash2, CreditCard } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { DeliveryRule, DeliveryMode } from '../types'
import { formatPrice } from '../utils/calculations'
import toast from 'react-hot-toast'

const Parametres: React.FC = () => {
  // Labels pour les modes de livraison
  const deliveryModeLabels: Record<DeliveryMode, string> = {
    colissimo: 'Colissimo',
    gls: 'GLS'
  }

  const { deliveryRules, updateDeliveryRules, vatEnabled, vatRate, setVatEnabled, setVatRate } = useApp()
  const [rules, setRules] = useState<DeliveryRule[]>([...deliveryRules])
  const [hasChanges, setHasChanges] = useState(false)

  const updateRule = (index: number, field: keyof DeliveryRule, value: string | number) => {
    const updatedRules = [...rules]
    updatedRules[index] = { ...updatedRules[index], [field]: value }
    setRules(updatedRules)
    setHasChanges(true)
  }

  const addRule = () => {
    const lastRule = rules[rules.length - 1]
    const newRule: DeliveryRule = {
      id: Date.now().toString(),
      delivery_mode: 'colissimo',
      min_weight: lastRule ? lastRule.max_weight : 0,
      max_weight: lastRule ? lastRule.max_weight + 10 : 10,
      price: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setRules([...rules, newRule])
    setHasChanges(true)
  }

  const removeRule = (index: number) => {
    if (rules.length <= 1) {
      toast.error('Au moins une règle de livraison est requise')
      return
    }
    setRules(rules.filter((_, i) => i !== index))
    setHasChanges(true)
  }

  const validateRules = (rulesToValidate: DeliveryRule[]): boolean => {
    // Vérifier qu'il n'y a pas de chevauchement et que les plages sont continues par mode de livraison
    const rulesByMode = rulesToValidate.reduce((acc, rule) => {
      if (!acc[rule.delivery_mode]) {
        acc[rule.delivery_mode] = []
      }
      acc[rule.delivery_mode].push(rule)
      return acc
    }, {} as Record<DeliveryMode, DeliveryRule[]>)
    
    for (const [mode, modeRules] of Object.entries(rulesByMode)) {
      const sortedRules = [...modeRules].sort((a, b) => a.min_weight - b.min_weight)
      
      for (let i = 0; i < sortedRules.length; i++) {
        const rule = sortedRules[i]
        
        if (rule.min_weight >= rule.max_weight) {
          toast.error(`Erreur règle ${deliveryModeLabels[mode as DeliveryMode]} ${i + 1}: le poids minimum doit être inférieur au poids maximum`)
          return false
        }
        
        if (rule.price < 0) {
          toast.error(`Erreur règle ${deliveryModeLabels[mode as DeliveryMode]} ${i + 1}: le prix ne peut pas être négatif`)
          return false
        }
        
        if (i > 0) {
          const prevRule = sortedRules[i - 1]
          if (rule.min_weight < prevRule.max_weight) {
            toast.error(`Erreur règles ${deliveryModeLabels[mode as DeliveryMode]}: chevauchement de plages de poids`)
            return false
          }
        }
        
        // Vérifier qu'il n'y a pas de chevauchement avec d'autres règles du même mode
        for (let j = i + 1; j < sortedRules.length; j++) {
          const otherRule = sortedRules[j]
          if (rule.max_weight > otherRule.min_weight) {
            toast.error(`Erreur règles ${deliveryModeLabels[mode as DeliveryMode]}: chevauchement de plages de poids`)
            return false
          }
        }
      }
    }
    
    return true
  }

  const handleSave = async () => {
    if (!validateRules(rules)) return
    
    // Trier les règles par mode de livraison puis par poids minimum
    const sortedRules = [...rules].sort((a, b) => {
      if (a.delivery_mode !== b.delivery_mode) {
        return a.delivery_mode.localeCompare(b.delivery_mode)
      }
      return a.min_weight - b.min_weight
    })
    await updateDeliveryRules(sortedRules)
    setRules(sortedRules)
    setHasChanges(false)
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-primary-accent mb-2">Paramètres</h2>
        <p className="text-primary-light opacity-70">Configuration des frais de livraison</p>
      </motion.div>

      {/* Règles de livraison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 space-y-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Truck className="h-6 w-6 text-primary-accent" />
          <h3 className="text-xl font-bold text-primary-accent">Frais de livraison par tranche de poids</h3>
        </div>

        <div className="space-y-4">
          {rules.map((rule, index) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-primary-light bg-opacity-5 p-4 rounded-lg border border-primary-light border-opacity-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                    Mode de livraison
                  </label>
                  <select
                    value={rule.delivery_mode}
                    onChange={(e) => updateRule(index, 'delivery_mode', e.target.value as DeliveryMode)}
                    className="input-primary"
                  >
                    {(Object.keys(deliveryModeLabels) as DeliveryMode[]).map((mode) => (
                      <option key={mode} value={mode}>
                        {deliveryModeLabels[mode]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                    Poids min (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={rule.min_weight}
                    onChange={(e) => updateRule(index, 'min_weight', parseFloat(e.target.value) || 0)}
                    className="input-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                    Poids max (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={rule.max_weight}
                    onChange={(e) => updateRule(index, 'max_weight', parseFloat(e.target.value) || 0)}
                    className="input-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
                    Prix (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={rule.price}
                    onChange={(e) => updateRule(index, 'price', parseFloat(e.target.value) || 0)}
                    className="input-primary"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => removeRule(index)}
                    disabled={rules.length <= 1}
                    className="p-3 bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-30 rounded-lg hover:bg-opacity-30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 text-sm text-primary-light opacity-60">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium mr-2 ${
                  rule.delivery_mode === 'colissimo' 
                    ? 'bg-primary-secondary bg-opacity-20 text-primary-secondary' 
                    : 'bg-primary-tertiary bg-opacity-20 text-primary-tertiary'
                }`}>
                  {deliveryModeLabels[rule.delivery_mode]}
                </span>
                De {rule.min_weight} kg à {rule.max_weight} kg → {formatPrice(rule.price)}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={addRule}
            className="btn-secondary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Ajouter une règle Colissimo</span>
          </button>

          <button
            onClick={() => {
              const lastGlsRule = rules.filter(r => r.delivery_mode === 'gls').sort((a, b) => b.max_weight - a.max_weight)[0]
              const newRule: DeliveryRule = {
                id: Date.now().toString(),
                delivery_mode: 'gls',
                min_weight: lastGlsRule ? lastGlsRule.max_weight : 0,
                max_weight: lastGlsRule ? lastGlsRule.max_weight + 10 : 10,
                price: 6,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
              setRules([...rules, newRule])
              setHasChanges(true)
            }}
            className="btn-outline flex items-center space-x-2 border-primary-tertiary text-primary-tertiary hover:bg-primary-tertiary hover:text-primary-dark"
          >
            <Plus className="h-5 w-5" />
            <span>Ajouter une règle GLS</span>
          </button>

          {hasChanges && (
            <button
              onClick={handleSave}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="h-5 w-5" />
              <span>Sauvegarder</span>
            </button>
          )}
        </div>

        {hasChanges && (
          <div className="bg-orange-500 bg-opacity-20 border border-orange-500 border-opacity-30 p-4 rounded-lg">
            <p className="text-orange-400 text-sm">
              ⚠️ Vous avez des modifications non sauvegardées
            </p>
          </div>
        )}
      </motion.div>

      {/* Configuration TVA globale */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6 space-y-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <CreditCard className="h-6 w-6 text-primary-accent" />
          <h3 className="text-xl font-bold text-primary-accent">Configuration TVA par défaut</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="global-vat-enabled"
              checked={vatEnabled}
              onChange={(e) => setVatEnabled(e.target.checked)}
              className="w-5 h-5 text-primary-accent bg-primary-light bg-opacity-10 border-primary-light border-opacity-30 rounded focus:ring-primary-accent focus:ring-2"
            />
            <label htmlFor="global-vat-enabled" className="text-primary-light font-medium">
              Activer la TVA par défaut pour les nouvelles commandes
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="text-sm text-primary-light opacity-70 min-w-[120px]">
              Taux TVA par défaut:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={vatRate}
                onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                className="w-24 input-primary"
              />
              <span className="text-primary-light opacity-70">%</span>
            </div>
          </div>
          
          <div className="bg-primary-accent bg-opacity-10 border border-primary-accent border-opacity-30 p-4 rounded-lg">
            <p className="text-primary-accent text-sm">
              💡 Ces paramètres s'appliquent par défaut aux nouvelles commandes. La TVA s'applique uniquement aux produits, jamais aux frais de livraison. Vous pouvez toujours modifier la TVA individuellement pour chaque commande.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Parametres