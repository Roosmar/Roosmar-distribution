import { Link, useLocation } from 'react-router-dom'
import { Home, Package, ShoppingCart, History, Settings, Users, Clock } from 'lucide-react'

const Navigation: React.FC = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/catalogue', icon: Package, label: 'Catalogue' },
    { path: '/clients', icon: Users, label: 'Clients' },
    { path: '/commandes', icon: ShoppingCart, label: 'Commande' },
    { path: '/commandes-a-valider', icon: Clock, label: 'À valider' },
    { path: '/historique', icon: History, label: 'Historique' },
    { path: '/parametres', icon: Settings, label: 'Paramètres' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-primary-dark bg-opacity-95 backdrop-blur-sm border-t border-primary-light border-opacity-20 md:relative md:bg-transparent md:border-none">
      <div className="container mx-auto">
        <div className="flex justify-around md:justify-start md:space-x-6 py-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-primary-accent bg-primary-accent bg-opacity-20'
                    : 'text-primary-light hover:text-primary-accent hover:bg-primary-light hover:bg-opacity-10'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Navigation