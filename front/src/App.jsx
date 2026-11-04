import { Routes, Route } from 'react-router-dom'
import { FavoritesProvider } from './context/FavoritesContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import CatalogoLayout from './pages/CatalogoLayout'
import Catalogo from './pages/Catalogo'
import CatalogoCategoria from './pages/CatalogoCategoria'
import DetalleProducto from './pages/DetalleProducto'
import Favoritos from './pages/Favoritos'
import Administracion from './pages/Administracion'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <FavoritesProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/productos" element={<CatalogoLayout />}>
              <Route index element={<Catalogo />} />
              <Route path="categoria/:catId" element={<CatalogoCategoria />} />
            </Route>
            <Route path="/productos/:id" element={<DetalleProducto />} />
            <Route path="/favoritos" element={<Favoritos />} />
            <Route path="/administracion" element={<Administracion />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </FavoritesProvider>
  )
}
