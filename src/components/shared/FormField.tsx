import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react'

interface FieldWrapProps {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
}

export function FieldWrap({ label, required, hint, error, children }: FieldWrapProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-sans font-medium text-[#6B6560] uppercase tracking-wider">
        {label}{required && <span className="text-[#B85C38] ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-[#A8A29E] font-sans">{hint}</p>}
      {error && <p className="text-xs text-red-600 font-sans">{error}</p>}
    </div>
  )
}

const inputBase = `
  w-full px-3 py-2 text-sm font-sans text-[#1A1814] bg-white
  border border-[#E5DED6] rounded-[3px]
  placeholder:text-[#C9BEB5]
  focus:outline-none focus:border-[#B85C38] focus:ring-1 focus:ring-[#B85C38]/20
  transition-colors duration-150
`

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputBase} {...props} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement> & { rows?: number }) {
  return <textarea className={`${inputBase} resize-none`} rows={props.rows ?? 3} {...props} />
}

export function Select({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${inputBase} cursor-pointer appearance-none`} {...props}>
      {children}
    </select>
  )
}
