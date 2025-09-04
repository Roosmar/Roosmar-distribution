import { useLocation } from 'react-router-dom'

const pageNames: Record<string, string> = {
  '/': 'Dashboard',
  '/catalogue': 'Catalogue',
  '/clients': 'Clients',
  '/commandes': 'Commande',
  '/commandes-a-valider': 'Commandes à valider',
  '/historique': 'Historique',
  '/parametres': 'Paramètres'
}

const Header: React.FC = () => {
  const location = useLocation()
  const currentPage = pageNames[location.pathname] || 'Roosmar Distribution'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary-dark bg-opacity-95 backdrop-blur-sm border-b border-primary-light border-opacity-20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary-accent">Roosmar Distribution</h1>
            <p className="text-sm text-primary-light opacity-70">{currentPage}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-primary-light opacity-70">Synchronisé</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header