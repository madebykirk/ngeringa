import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  footer?: ReactNode
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export function Modal({ open, onClose, title, subtitle, children, size = 'md', footer }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(26,24,20,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={`bg-[#F8F5F0] w-full ${sizeMap[size]} rounded-[4px] border border-[#E5DED6] flex flex-col max-h-[90vh]`}
        style={{ boxShadow: '0 8px 32px rgba(26,24,20,0.18)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#E5DED6]">
          <div>
            <h2 className="text-xl font-serif text-[#1A1814]">{title}</h2>
            {subtitle && <p className="text-sm text-[#6B6560] mt-0.5 font-sans">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-[#6B6560] hover:text-[#1A1814] transition-colors duration-150 mt-0.5 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#E5DED6] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
