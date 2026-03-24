import { useState } from 'react'
import { Plus, Trash2, FileDown } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { FieldWrap, Input, Textarea, Select } from '@/components/shared/FormField'
import { useStore } from '@/store'
import { uid, todayISO } from '@/utils/ids'
import type { WorksheetTask, WorksheetTaskType } from '@/types'
import { generateWorksheetPDF } from '@/utils/pdfGenerator'

interface WorksheetBuilderProps {
  open: boolean
  onClose: () => void
}

const taskTypeLabels: Record<WorksheetTaskType, string> = {
  'vineyard-pick': 'Vineyard Pick',
  'vineyard-task': 'Vineyard Task',
  'cellar-test': 'Cellar Test',
  'cellar-action': 'Cellar Action',
  'custom': 'Custom Task',
}

export function WorksheetBuilder({ open, onClose }: WorksheetBuilderProps) {
  const { parcels, batches, users, addWorksheet, addActivity } = useStore()
  const [date, setDate] = useState(todayISO())
  const [tasks, setTasks] = useState<WorksheetTask[]>([])
  const [generating, setGenerating] = useState(false)

  const addTask = () => {
    const newTask: WorksheetTask = {
      id: uid(),
      type: 'custom',
      description: '',
      assignedUserId: users.find((u) => u.status === 'active')?.id ?? '',
      notes: '',
    }
    setTasks((prev) => [...prev, newTask])
  }

  const updateTask = (id: string, updates: Partial<WorksheetTask>) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...updates } : t))
  }

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const handleSave = () => {
    const ws = { id: uid(), date, tasks, createdAt: new Date().toISOString() }
    addWorksheet(ws)
    addActivity({
      id: uid(),
      type: 'worksheet',
      description: `Worksheet created for ${date}`,
      date: new Date().toISOString(),
    })
    onClose()
    setTasks([])
    setDate(todayISO())
  }

  const handleGeneratePDF = async () => {
    setGenerating(true)
    try {
      await generateWorksheetPDF({ date, tasks, parcels, batches, users })
    } finally {
      setGenerating(false)
    }
  }

  const activeParcels = parcels
  const activeBatches = batches.filter((b) => b.status === 'active')
  const activeUsers = users.filter((u) => u.status === 'active')

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Today's Worksheet"
      subtitle="Build a daily task sheet for the vineyard and cellar team"
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="secondary" onClick={handleGeneratePDF} loading={generating}>
            <FileDown size={14} />
            Generate PDF
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={tasks.length === 0}>
            Save Worksheet
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Date */}
        <FieldWrap label="Date" required>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </FieldWrap>

        {/* Tasks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-mono uppercase tracking-widest text-[#6B6560]">Tasks</p>
            <Button size="sm" variant="ghost" onClick={addTask}>
              <Plus size={13} /> Add Task
            </Button>
          </div>

          {tasks.length === 0 && (
            <div className="border border-dashed border-[#E5DED6] rounded-[3px] p-6 text-center">
              <p className="text-sm text-[#A8A29E] font-sans">No tasks yet. Add tasks above.</p>
            </div>
          )}

          <div className="space-y-4">
            {tasks.map((task, idx) => (
              <div key={task.id} className="border border-[#E5DED6] rounded-[3px] p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-[#A8A29E]">Task {idx + 1}</span>
                  <button onClick={() => removeTask(task.id)} className="text-[#A8A29E] hover:text-red-500 transition-colors cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FieldWrap label="Type" required>
                    <Select
                      value={task.type}
                      onChange={(e) => updateTask(task.id, { type: e.target.value as WorksheetTaskType })}
                    >
                      {Object.entries(taskTypeLabels).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </Select>
                  </FieldWrap>

                  <FieldWrap label="Assigned To">
                    <Select
                      value={task.assignedUserId}
                      onChange={(e) => updateTask(task.id, { assignedUserId: e.target.value })}
                    >
                      <option value="">— Unassigned —</option>
                      {activeUsers.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </Select>
                  </FieldWrap>

                  {(task.type === 'vineyard-pick' || task.type === 'vineyard-task') && (
                    <FieldWrap label="Parcel">
                      <Select
                        value={task.parcelId ?? ''}
                        onChange={(e) => updateTask(task.id, { parcelId: e.target.value || undefined })}
                      >
                        <option value="">— Select parcel —</option>
                        {activeParcels.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} ({p.parcelId})</option>
                        ))}
                      </Select>
                    </FieldWrap>
                  )}

                  {(task.type === 'cellar-test' || task.type === 'cellar-action') && (
                    <FieldWrap label="Batch">
                      <Select
                        value={task.batchId ?? ''}
                        onChange={(e) => updateTask(task.id, { batchId: e.target.value || undefined })}
                      >
                        <option value="">— Select batch —</option>
                        {activeBatches.map((b) => (
                          <option key={b.id} value={b.id}>{b.batchId}{b.nickname ? ` — ${b.nickname}` : ''}</option>
                        ))}
                      </Select>
                    </FieldWrap>
                  )}

                  <FieldWrap label="Description" required>
                    <Input
                      placeholder="Task description..."
                      value={task.description}
                      onChange={(e) => updateTask(task.id, { description: e.target.value })}
                    />
                  </FieldWrap>
                </div>

                {task.type === 'cellar-test' && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <FieldWrap label="pH">
                      <Input placeholder="3.4" value={task.ph ?? ''} onChange={(e) => updateTask(task.id, { ph: e.target.value })} />
                    </FieldWrap>
                    <FieldWrap label="Baume">
                      <Input placeholder="8.2" value={task.baume ?? ''} onChange={(e) => updateTask(task.id, { baume: e.target.value })} />
                    </FieldWrap>
                    <FieldWrap label="Temp (°C)">
                      <Input placeholder="22" value={task.temp ?? ''} onChange={(e) => updateTask(task.id, { temp: e.target.value })} />
                    </FieldWrap>
                  </div>
                )}

                <div className="mt-3">
                  <FieldWrap label="Notes">
                    <Textarea
                      rows={2}
                      placeholder="Additional notes..."
                      value={task.notes}
                      onChange={(e) => updateTask(task.id, { notes: e.target.value })}
                    />
                  </FieldWrap>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
