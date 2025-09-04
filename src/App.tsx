import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SupabaseProvider } from './contexts/SupabaseContext'
import { AppProvider } from './contexts/AppContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Catalogue from './pages/Catalogue'
import Clients from './pages/Clients'
import Commandes from './pages/Commandes'
import CommandesAValider from './pages/CommandesAValider'
import Historique from './pages/Historique'
import Parametres from './pages/Parametres'

function App() {
  return (
    <SupabaseProvider>
      <AppProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/catalogue" element={<Catalogue />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/commandes" element={<Commandes />} />
              <Route path="/commandes-a-valider" element={<CommandesAValider />} />
              <Route path="/historique" element={<Historique />} />
              <Route path="/parametres" element={<Parametres />} />
            </Routes>
          </Layout>
        </Router>
      </AppProvider>
    </SupabaseProvider>
  )
}

export default App