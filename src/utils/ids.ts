// Generates a short random ID
export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

// Generates a batch ID like PIN_3 or CHA_1
export function generateBatchId(variety: string, existingBatches: { batchId: string }[]): string {
  const prefix = variety.slice(0, 3).toUpperCase()
  const same = existingBatches.filter((b) => b.batchId.startsWith(prefix))
  return `${prefix}_${same.length + 1}`
}

// Format date for display
export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Format date for input value
export function toInputDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function todayISO(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function relativeTime(dateStr: string): string {
  const now = new Date()
  const then = new Date(dateStr)
  const diffMs = now.getTime() - then.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return formatDate(dateStr)
}
