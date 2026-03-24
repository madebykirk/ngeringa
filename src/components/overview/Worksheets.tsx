import { useState } from 'react'
import { FileText, FileDown, Trash2, Plus } from 'lucide-react'
import { useStore } from '@/store'
import { formatDate } from '@/utils/ids'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { WorksheetBuilder } from './WorksheetBuilder'
import { generateWorksheetPDF } from '@/utils/pdfGenerator'

export function Worksheets() {
  const { worksheets, parcels, batches, users, deleteWorksheet } = useStore()
  const [showBuilder, setShowBuilder] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null)

  const sorted = [...worksheets].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleDownload = async (wsId: string) => {
    const ws = worksheets.find((w) => w.id === wsId)
    if (!ws) return
    setGenerating(wsId)
    try {
      await generateWorksheetPDF({ date: ws.date, tasks: ws.tasks, parcels, batches, users })
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div className="min-h-full">
      <div className="px-10 pt-10 pb-0 flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-[#A8A29E] uppercase tracking-widest mb-2">Contrada</p>
          <h1 className="text-3xl font-serif text-[#1A1814]">Worksheets</h1>
          <p className="text-sm font-sans text-[#6B6560] mt-1">{worksheets.length} saved worksheets</p>
        </div>
        <Button variant="primary" className="mt-1" onClick={() => setShowBuilder(true)}>
          <Plus size={14} /> New Worksheet
        </Button>
      </div>

      <div className="px-10 mt-8 pb-12">
        {sorted.length === 0 ? (
          <div className="bg-white border border-[#E5DED6] rounded-[4px] p-12 text-center">
            <FileText size={32} className="text-[#E5DED6] mx-auto mb-3" />
            <p className="text-sm font-sans text-[#A8A29E]">No worksheets saved yet.</p>
            <button onClick={() => setShowBuilder(true)} className="mt-3 text-xs font-mono text-[#B85C38] hover:underline cursor-pointer">Create today's worksheet →</button>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((ws) => {
              const vineyardCount = ws.tasks.filter((t) => t.type.startsWith('vineyard')).length
              const cellarCount = ws.tasks.filter((t) => t.type.startsWith('cellar')).length
              const otherCount = ws.tasks.filter((t) => t.type === 'custom').length

              return (
                <div key={ws.id} className="bg-white border border-[#E5DED6] rounded-[4px] px-5 py-4 flex items-center gap-4 hover:border-[#C9BEB5] transition-colors">
                  <FileText size={16} className="text-[#A8A29E] flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-mono text-[#1A1814]">{formatDate(ws.date)}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {vineyardCount > 0 && <Badge variant="sage">{vineyardCount} vineyard</Badge>}
                      {cellarCount > 0 && <Badge variant="accent">{cellarCount} cellar</Badge>}
                      {otherCount > 0 && <Badge variant="muted">{otherCount} other</Badge>}
                      {ws.tasks.length === 0 && <Badge variant="muted">empty</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(ws.id)}
                      disabled={generating === ws.id}
                      className="flex items-center gap-1.5 text-xs font-mono text-[#6B6560] hover:text-[#B85C38] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <FileDown size={14} />
                      {generating === ws.id ? 'Generating...' : 'PDF'}
                    </button>
                    <button
                      onClick={() => deleteWorksheet(ws.id)}
                      className="text-[#E5DED6] hover:text-red-400 transition-colors cursor-pointer ml-2"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <WorksheetBuilder open={showBuilder} onClose={() => setShowBuilder(false)} />
    </div>
  )
}
