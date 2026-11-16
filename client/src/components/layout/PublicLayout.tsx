import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { CartDrawer } from '../cart/CartDrawer'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export function PublicLayout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <CartDrawer />
    </div>
  )
}
