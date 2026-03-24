import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'accent' | 'sage' | 'warning' | 'success' | 'muted'
}

const variants = {
  default: 'bg-[#F0EBE3] text-[#1A1814] border-[#C9BEB5]',
  accent: 'bg-[#F0E6E0] text-[#B85C38] border-[#E5C4B6]',
  sage: 'bg-[#E8EDE5] text-[#7A8C6E] border-[#C5D0BE]',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  success: 'bg-green-50 text-green-800 border-green-200',
  muted: 'bg-transparent text-[#A8A29E] border-[#E5DED6]',
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium rounded-[2px] border ${variants[variant]}`}>
      {children}
    </span>
  )
}
