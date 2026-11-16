import type { ButtonHTMLAttributes } from 'react'
import { Spinner } from './Spinner'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'gold' | 'ghost' | 'light' | 'danger'
  loading?: boolean
  size?: 'sm' | 'md'
}

const VARIANTS = {
  primary: 'btn-primary',
  gold: 'btn-gold',
  ghost: 'btn-ghost',
  light: 'btn-light',
  danger: 'btn bg-rose-700 text-white hover:bg-rose-800',
} as const

export function Button({
  variant = 'primary',
  loading = false,
  size = 'md',
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${VARIANTS[variant]} ${size === 'sm' ? 'px-4 py-2 text-[0.7rem]' : ''} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Spinner className="h-4 w-4" /> : null}
      {children}
    </button>
  )
}
