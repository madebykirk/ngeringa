import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Check, X, FlaskConical } from 'lucide-react'
import { useStore } from '@/store'
import { formatDate, uid, todayISO } from '@/utils/ids'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { FieldWrap, Input, Textarea } from '@/components/shared/FormField'
import { ActionModal } from './ActionModal'
import { Modal } from '@/components/shared/Modal'
import type { DailyLogEntry } from '@/types'

export function BatchDetail() {
  const { batchId } = useParams<{ batchId: string }>()
  const navigate = useNavigate()
  const { batches, parcels, tanks, barrels, users, addDailyLogEntry, updateDailyLogEntry, completeBatch, addActivity } = useStore()

  const batch = batches.find((b) => b.id === batchId)
  const [showAction, setShowAction] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [completionNotes, setCompletionNotes] = useState('')
  const [editingLog, setEditingLog] = useState<string | null>(null)
  const [editLogValues, setEditLogValues] = useState<Partial<DailyLogEntry>>({})
  const [addingLog, setAddingLog] = useState(false)
  const [newLog, setNewLog] = useState({ date: todayISO(), ph: '', baume: '', temperature: '', notes: '' })

  if (!batch) {
    return (
      <div className="px-10 pt-10">
        <p className="text-sm font-sans text-[#A8A29E]">Batch not found.</p>
      </div>
    )
  }

  const parcel = parcels.find((p) => p.id === batch.parcelId)
  const vessel = batch.vesselType === 'tank'
    ? tanks.find((t) => t.id === batch.vesselId)
    : barrels.find((b) => b.id === batch.vesselId)
  const vesselLabel = batch.vesselType === 'tank'
    ? `Tank ${(vessel as { tankId?: string })?.tankId ?? ''}`
    : `Barrel ${(vessel as { barrelId?: string })?.barrelId ?? ''}`

  const sortedLog = [...batch.dailyLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const sortedActions = [...batch.actions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const todayHasLog = batch.dailyLog.some((l) => l.date === todayISO())

  const handleAddLog = () => {
    addDailyLogEntry(batch.id, {
      id: uid(),
      date: newLog.date,
      ph: newLog.ph ? parseFloat(newLog.ph) : null,
      baume: newLog.baume ? parseFloat(newLog.baume) : null,
      temperature: newLog.temperature ? parseFloat(newLog.temperature) : null,
      notes: newLog.notes,
    })
    addActivity({
      id: uid(),
      type: 'batch-log',
      description: `Daily log — ${batch.batchId}: pH ${newLog.ph || '—'} / ${newLog.baume || '—'}° Baume`,
      date: new Date().toISOString(),
      batchId: batch.id,
    })
    setAddingLog(false)
    setNewLog({ date: todayISO(), ph: '', baume: '', temperature: '', notes: '' })
  }

  const handleComplete = () => {
    completeBatch(batch.id, completionNotes)
    addActivity({
      id: uid(),
      type: 'batch-action',
      description: `Batch completed: ${batch.batchId}`,
      date: new Date().toISOString(),
      batchId: batch.id,
    })
    setShowComplete(false)
    navigate('/cellar')
  }

  const getUserName = (id?: string) => users.find((u) => u.id === id)?.name

  return (
    <div className="min-h-full">
      {/* Back header */}
      <div className="px-10 pt-8 pb-0">
        <button
          onClick={() => navigate('/cellar')}
          className="flex items-center gap-2 text-xs font-mono text-[#A8A29E] hover:text-[#1A1814] transition-colors mb-5 cursor-pointer"
        >
          <ArrowLeft size={13} /> Back to Cellar
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <p className="text-xs font-mono text-[#A8A29E]">Batch</p>
              <Badge variant={batch.status === 'active' ? 'accent' : 'muted'}>{batch.status}</Badge>
            </div>
            <h1 className="text-3xl font-serif text-[#1A1814]">{batch.batchId}</h1>
            {batch.nickname && <p className="text-base font-sans text-[#6B6560] mt-1 italic">{batch.nickname}</p>}
            <p className="text-xs font-mono text-[#A8A29E] mt-2">
              {parcel?.name} · {vesselLabel} · Started {formatDate(batch.startDate)}
            </p>
          </div>

          <div className="flex gap-2 mt-1">
            <Button size="sm" variant="secondary" onClick={() => setShowAction(true)}>
              <Plus size={13} /> Action
            </Button>
            {batch.status === 'active' && (
              <Button size="sm" variant="ghost" onClick={() => setShowComplete(true)}>
                <Check size={13} /> Complete
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="px-10 mt-8 pb-12 grid grid-cols-3 gap-8">
        {/* Daily log */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-serif text-[#1A1814]">Daily Log</h3>
            {batch.status === 'active' && !todayHasLog && (
              <Button size="sm" variant="ghost" onClick={() => setAddingLog(true)}>
                <Plus size={13} /> Add Today
              </Button>
            )}
          </div>

          <div className="bg-white border border-[#E5DED6] rounded-[4px] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0EBE3]">
                  {['Date', 'pH', 'Baume', 'Temp °C', 'Notes', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#A8A29E]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {addingLog && (
                  <tr className="border-b border-[#F0EBE3] bg-[#FFF8F5]">
                    <td className="px-3 py-2"><Input type="date" value={newLog.date} onChange={(e) => setNewLog((l) => ({ ...l, date: e.target.value }))} className="py-1 w-32" /></td>
                    <td className="px-3 py-2"><Input type="number" step="0.01" placeholder="3.45" value={newLog.ph} onChange={(e) => setNewLog((l) => ({ ...l, ph: e.target.value }))} className="py-1 w-16" /></td>
                    <td className="px-3 py-2"><Input type="number" step="0.1" placeholder="8.2" value={newLog.baume} onChange={(e) => setNewLog((l) => ({ ...l, baume: e.target.value }))} className="py-1 w-16" /></td>
                    <td className="px-3 py-2"><Input type="number" step="0.1" placeholder="22" value={newLog.temperature} onChange={(e) => setNewLog((l) => ({ ...l, temperature: e.target.value }))} className="py-1 w-16" /></td>
                    <td className="px-3 py-2"><Input placeholder="Notes..." value={newLog.notes} onChange={(e) => setNewLog((l) => ({ ...l, notes: e.target.value }))} className="py-1" /></td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button onClick={handleAddLog} className="text-[#7A8C6E] hover:text-green-600 cursor-pointer"><Check size={14} /></button>
                        <button onClick={() => setAddingLog(false)} className="text-[#A8A29E] cursor-pointer"><X size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )}
                {sortedLog.map((entry) => (
                  editingLog === entry.id ? (
                    <tr key={entry.id} className="border-b border-[#F0EBE3] bg-[#FFF8F5]">
                      <td className="px-4 py-3 font-mono text-xs text-[#A8A29E]">{formatDate(entry.date)}</td>
                      <td className="px-3 py-2"><Input type="number" step="0.01" value={editLogValues.ph ?? entry.ph ?? ''} onChange={(e) => setEditLogValues((v) => ({ ...v, ph: parseFloat(e.target.value) }))} className="py-1 w-16" /></td>
                      <td className="px-3 py-2"><Input type="number" step="0.1" value={editLogValues.baume ?? entry.baume ?? ''} onChange={(e) => setEditLogValues((v) => ({ ...v, baume: parseFloat(e.target.value) }))} className="py-1 w-16" /></td>
                      <td className="px-3 py-2"><Input type="number" step="0.1" value={editLogValues.temperature ?? entry.temperature ?? ''} onChange={(e) => setEditLogValues((v) => ({ ...v, temperature: parseFloat(e.target.value) }))} className="py-1 w-16" /></td>
                      <td className="px-3 py-2"><Input value={editLogValues.notes ?? entry.notes} onChange={(e) => setEditLogValues((v) => ({ ...v, notes: e.target.value }))} className="py-1" /></td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <button onClick={() => { updateDailyLogEntry(batch.id, entry.id, editLogValues); setEditingLog(null) }} className="text-[#7A8C6E] hover:text-green-600 cursor-pointer"><Check size={14} /></button>
                          <button onClick={() => setEditingLog(null)} className="text-[#A8A29E] cursor-pointer"><X size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={entry.id}
                      className="border-b border-[#F8F5F0] hover:bg-[#FDFAF7] cursor-pointer group"
                      onClick={() => { setEditingLog(entry.id); setEditLogValues({}) }}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[#A8A29E]">{formatDate(entry.date)}</td>
                      <td className="px-4 py-3 font-mono text-[#1A1814]">{entry.ph ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-[#1A1814]">{entry.baume ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-[#1A1814]">{entry.temperature ?? '—'}</td>
                      <td className="px-4 py-3 font-sans text-xs text-[#6B6560]">{entry.notes || '—'}</td>
                      <td className="px-4 py-3 text-xs font-mono text-[#E5DED6] group-hover:text-[#A8A29E]">edit</td>
                    </tr>
                  )
                ))}
                {sortedLog.length === 0 && !addingLog && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs font-sans text-[#A8A29E]">
                      No log entries yet. Add today's measurements.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions timeline */}
        <div>
          <h3 className="text-sm font-serif text-[#1A1814] mb-3">Action Log</h3>
          {sortedActions.length === 0 ? (
            <div className="bg-white border border-[#E5DED6] rounded-[4px] p-6 text-center">
              <FlaskConical size={24} className="text-[#E5DED6] mx-auto mb-2" />
              <p className="text-xs font-sans text-[#A8A29E]">No actions logged.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedActions.map((action) => (
                <div key={action.id} className="bg-white border border-[#E5DED6] rounded-[4px] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="accent">{action.type}</Badge>
                    <span className="text-xs font-mono text-[#A8A29E]">{formatDate(action.date)}</span>
                  </div>
                  {action.notes && <p className="text-xs font-sans text-[#6B6560] mt-2">{action.notes}</p>}
                  {action.assignedUserId && (
                    <p className="text-xs font-mono text-[#A8A29E] mt-1">{getUserName(action.assignedUserId)}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Completion notes */}
          {batch.status === 'completed' && batch.completionNotes && (
            <div className="mt-4 bg-[#E8EDE5] border border-[#C5D0BE] rounded-[3px] px-4 py-3">
              <p className="text-xs font-mono uppercase tracking-wider text-[#7A8C6E] mb-1">Completion Notes</p>
              <p className="text-sm font-sans text-[#1A1814]">{batch.completionNotes}</p>
              {batch.completedAt && <p className="text-xs font-mono text-[#A8A29E] mt-2">{formatDate(batch.completedAt)}</p>}
            </div>
          )}
        </div>
      </div>

      <ActionModal open={showAction} batchId={batch.id} onClose={() => setShowAction(false)} />

      {/* Complete modal */}
      <Modal
        open={showComplete}
        onClose={() => setShowComplete(false)}
        title="Complete Batch"
        subtitle={`Mark ${batch.batchId} as complete`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowComplete(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleComplete}>Complete Batch</Button>
          </>
        }
      >
        <FieldWrap label="Final Notes">
          <Textarea
            rows={4}
            placeholder="Final observations, press date, yield, destination..."
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
          />
        </FieldWrap>
      </Modal>
    </div>
  )
}
