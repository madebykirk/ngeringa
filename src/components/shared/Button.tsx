import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  loading?: boolean
}

const variantStyles = {
  primary: 'bg-[#B85C38] text-white hover:bg-[#A04E2E] border border-[#B85C38] hover:border-[#A04E2E]',
  secondary: 'bg-transparent text-[#1A1814] border border-[#C9BEB5] hover:border-[#1A1814] hover:bg-[#F0E6E0]',
  ghost: 'bg-transparent text-[#6B6560] border border-transparent hover:text-[#1A1814] hover:bg-[#F0EBE3]',
  danger: 'bg-transparent text-red-700 border border-red-200 hover:bg-red-50',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
}

export function Button({ variant = 'secondary', size = 'md', children, loading, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center gap-2 font-sans font-medium rounded-[3px]
        transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]} ${sizeStyles[size]} ${className}
      `}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  )
}
