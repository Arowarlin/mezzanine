import { useEffect, useRef } from 'react'

export function useReveal<T extends HTMLElement>(threshold = 0.12) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    if (!('IntersectionObserver' in window)) {
      element.classList.add('is-visible')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            element.classList.add('is-visible')
            observer.disconnect()
          }
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold])

  return ref
}
