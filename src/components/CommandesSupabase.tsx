import { supabase } from '../supabase'
import { Database, TablesInsert, TablesUpdate, Tables } from '../types/supabase'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Save, AlertCircle } from 'lucide-react'

type CommandeRow = Database['commandes'];
type CommandeInsert = Database['commandes'];
type CommandeUpdate = Partial<Database['commandes']>;

const CommandesSupabase: React.FC = () => {
  const [commandes, setCommandes] = useState<CommandeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newCommande, setNewCommande] = useState<CommandeInsert>({
    client_name: '',
    total_amount: 0,
    status: 'pending'
  })

  // Charger les commandes depuis Supabase
  const fetchCommandes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('commandes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setCommandes(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
      console.error('Erreur Supabase:', err)
    } finally {
      setLoading(false)
    }
  }

  // Ajouter une nouvelle commande
  const addCommande = async () => {
    try {
      if (!newCommande.client_name || newCommande.total_amount <= 0) {
        setError('Veuillez remplir tous les champs correctement')
        return
      }

      const commandeData: CommandeInsert = {
        client_name: newCommande.client_name,
        total_amount: newCommande.total_amount,
        status: newCommande.status || 'pending'
      }

      const { data, error } = await supabase
      .from<Database['commandes']>('commandes')
        .insert([commandeData])
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setCommandes(prev => [data[0], ...prev])
        setNewCommande({ client_name: '', total_amount: 0, status: 'pending' })
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout')
      console.error('Erreur Supabase:', err)
    }
  }

  // Mettre à jour le statut d'une commande
  const updateCommandeStatus = async (id: string, newStatus: CommandeRow['status']) => {
    try {
      const updateData: CommandeUpdate = {
        status: newStatus,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
      .from<Database['commandes']>('commandes')
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      setCommandes(prev =>
        prev.map(cmd => cmd.id === id ? { ...cmd, status: newStatus, updated_at: new Date().toISOString() } : cmd)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
      console.error('Erreur Supabase:', err)
    }
  }

  // Charger les données au montage du composant
  useEffect(() => {
    fetchCommandes()
  }, [])

  const statusLabels = {
    pending: 'En attente',
    completed: 'Terminée',
    cancelled: 'Annulée'
  }

  const statusColors = {
    pending: 'status-non-paye',
    completed: 'status-paye',
    cancelled: 'bg-red-500 bg-opacity-20 text-red-300 border-red-500'
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-primary-accent mb-2">
          Commandes Supabase
        </h2>
        <p className="text-primary-light opacity-70">
          Exemple d'intégration avec Supabase
        </p>
      </motion.div>

      {/* Messages d'erreur */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 bg-red-500 bg-opacity-20 border-red-500 border-opacity-30"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Formulaire d'ajout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h3 className="text-lg font-bold text-primary-accent mb-4 flex items-center space-x-2">
          <ShoppingCart className="h-5 w-5" />
          <span>Nouvelle commande</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
              Nom du client
            </label>
            <input
              type="text"
              value={newCommande.client_name}
              onChange={(e) => setNewCommande(prev => ({ ...prev, client_name: e.target.value }))}
              className="input-primary"
              placeholder="Jean Dupont"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
              Montant total (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newCommande.total_amount}
              onChange={(e) => setNewCommande(prev => ({ ...prev, total_amount: parseFloat(e.target.value) || 0 }))}
              className="input-primary"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-light opacity-70 mb-2">
              Statut
            </label>
            <select
              value={newCommande.status || 'pending'}
              onChange={(e) => setNewCommande(prev => ({ ...prev, status: e.target.value as CommandeRow['status'] }))}
              className="input-primary"
            >
              <option value="pending">En attente</option>
              <option value="completed">Terminée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
        </div>

        <button
          onClick={addCommande}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="h-5 w-5" />
          <span>Ajouter la commande</span>
        </button>
      </motion.div>

      {/* Liste des commandes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-accent mx-auto"></div>
            <p className="text-primary-light opacity-70 mt-2">Chargement...</p>
          </div>
        ) : commandes.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="h-16 w-16 text-primary-light opacity-30 mx-auto mb-4" />
            <p className="text-primary-light opacity-70">Aucune commande trouvée</p>
          </div>
        ) : (
          commandes.map((commande, index) => (
            <motion.div
              key={commande.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-primary-light mb-1">
                    {commande.client_name}
                  </h4>
                  <p className="text-sm text-primary-light opacity-70">
                    Montant: <span className="font-medium text-primary-accent">
                      {commande.total_amount.toFixed(2)} €
                    </span>
                  </p>
                  <p className="text-xs text-primary-light opacity-50">
                    {new Date(commande.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <select
                    value={commande.status}
                    onChange={(e) => updateCommandeStatus(commande.id, e.target.value as CommandeRow['status'])}
                    className={`px-3 py-1 rounded-lg border text-sm font-medium transition-all duration-200 ${statusColors[commande.status]}`}
                  >
                    <option value="pending">En attente</option>
                    <option value="completed">Terminée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}

export default CommandesSupabase