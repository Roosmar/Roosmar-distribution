import { useLocation } from 'react-router-dom'
import Navigation from './Navigation'
import Header from './Header'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-primary-dark flex flex-col">
      <Header />
      <main className="flex-1 pt-16 pb-20 md:pb-0">
        {children}
      </main>
      <Navigation />
    </div>
  )
}

export default Layout