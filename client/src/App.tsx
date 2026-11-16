import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/admin/AdminLayout'
import { RequireAuth } from './components/admin/RequireAuth'
import { PublicLayout } from './components/layout/PublicLayout'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { SettingsProvider } from './context/SettingsContext'
import { AboutPage } from './pages/AboutPage'
import { CareersPage } from './pages/CareersPage'
import { ContactPage } from './pages/ContactPage'
import { DrinkPage } from './pages/DrinkPage'
import { EatPage } from './pages/EatPage'
import { GalleryPage } from './pages/GalleryPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { OrderPage } from './pages/OrderPage'
import { ReservationsPage } from './pages/ReservationsPage'
import { AdminCareersPage } from './pages/admin/AdminCareersPage'
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage'
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminGalleryPage } from './pages/admin/AdminGalleryPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage'
import { AdminProductsPage } from './pages/admin/AdminProductsPage'
import { AdminReservationsPage } from './pages/admin/AdminReservationsPage'
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage'

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="eat" element={<EatPage />} />
              <Route path="drink" element={<DrinkPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="reservations" element={<ReservationsPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="careers" element={<CareersPage />} />
              <Route path="order" element={<OrderPage />} />

              {/* Rutas antiguas en español: se conservan como redirecciones. */}
              <Route path="menu" element={<Navigate to="/eat" replace />} />
              <Route path="nosotros" element={<Navigate to="/about" replace />} />
              <Route path="galeria" element={<Navigate to="/gallery" replace />} />
              <Route path="reservaciones" element={<Navigate to="/reservations" replace />} />
              <Route path="pedido" element={<Navigate to="/order" replace />} />
              <Route path="contacto" element={<Navigate to="/contact" replace />} />

              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="pedidos" element={<AdminOrdersPage />} />
              <Route path="reservas" element={<AdminReservationsPage />} />
              <Route path="productos" element={<AdminProductsPage />} />
              <Route path="categorias" element={<AdminCategoriesPage />} />
              <Route path="galeria" element={<AdminGalleryPage />} />
              <Route path="empleos" element={<AdminCareersPage />} />
              <Route path="clientes" element={<AdminCustomersPage />} />
              <Route path="ajustes" element={<AdminSettingsPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </SettingsProvider>
  )
}
