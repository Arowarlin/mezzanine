import { Route, Routes } from 'react-router-dom'
import { PublicLayout } from './components/layout/PublicLayout'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { SettingsProvider } from './context/SettingsContext'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { GalleryPage } from './pages/GalleryPage'
import { HomePage } from './pages/HomePage'
import { MenuPage } from './pages/MenuPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { OrderPage } from './pages/OrderPage'
import { ReservationsPage } from './pages/ReservationsPage'

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="menu" element={<MenuPage />} />
              <Route path="nosotros" element={<AboutPage />} />
              <Route path="galeria" element={<GalleryPage />} />
              <Route path="reservaciones" element={<ReservationsPage />} />
              <Route path="pedido" element={<OrderPage />} />
              <Route path="contacto" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </SettingsProvider>
  )
}
