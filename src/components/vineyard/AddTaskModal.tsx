import { useState } from 'react'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/shared/Button'
import { FieldWrap, Input, Textarea, Select } from '@/components/shared/FormField'
import { useStore } from '@/store'
import { uid, todayISO } from '@/utils/ids'
import type { VineyardTaskType } from '@/types'

const taskTypes: VineyardTaskType[] = [
  'Spraying', 'Canopy management', 'Soil work', 'Irrigation', 'Monitoring', 'Other'
]

interface Props { open: boolean; onClose: () => void; defaultParcelId?: string }

export function AddTaskModal({ open, onClose, defaultParcelId }: Props) {
  const { parcels, users, addVineyardTask, addActivity } = useStore()
  const [form, setForm] = useState({
    parcelId: defaultParcelId ?? 'all',
    type: 'Spraying' as VineyardTaskType,
    date: todayISO(),
    assignedUserId: '',
    notes: '',
  })

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))
  const activeUsers = users.filter((u) => u.status === 'active')

  const handleSubmit = () => {
    const parcel = parcels.find((p) => p.id === form.parcelId)
    const user = users.find((u) => u.id === form.assignedUserId)
    const task = {
      id: uid(),
      parcelId: form.parcelId,
      type: form.type,
      date: form.date,
      assignedUserId: form.assignedUserId,
      notes: form.notes,
      createdAt: new Date().toISOString(),
    }
    addVineyardTask(task)
    addActivity({
      id: uid(),
      type: 'vineyard-task',
      description: `${form.type}${parcel ? ` — ${parcel.name}` : ''}${user ? ` (${user.name})` : ''}`,
      date: new Date().toISOString(),
      parcelId: form.parcelId !== 'all' ? form.parcelId : undefined,
    })
    onClose()
    setForm({ parcelId: defaultParcelId ?? 'all', type: 'Spraying', date: todayISO(), assignedUserId: '', notes: '' })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Vineyard Task"
      subtitle="Log a task for a parcel or the whole vineyard"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Add Task</Button>
        </>
      }
    >
      <div className="space-y-4">
        <FieldWrap label="Parcel">
          <Select value={form.parcelId} onChange={(e) => set('parcelId', e.target.value)}>
            <option value="all">All / General</option>
            {parcels.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.parcelId})</option>
            ))}
          </Select>
        </FieldWrap>

        <div className="grid grid-cols-2 gap-4">
          <FieldWrap label="Task Type" required>
            <Select value={form.type} onChange={(e) => set('type', e.target.value as VineyardTaskType)}>
              {taskTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </FieldWrap>
          <FieldWrap label="Date" required>
            <Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
          </FieldWrap>
        </div>

        <FieldWrap label="Assigned To">
          <Select value={form.assignedUserId} onChange={(e) => set('assignedUserId', e.target.value)}>
            <option value="">— Unassigned —</option>
            {activeUsers.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </Select>
        </FieldWrap>

        <FieldWrap label="Notes">
          <Textarea placeholder="Task details, products used, observations..." value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </FieldWrap>
      </div>
    </Modal>
  )
}
