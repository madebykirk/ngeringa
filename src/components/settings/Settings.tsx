import { useState } from 'react'
import { Plus, Edit2, Check, X } from 'lucide-react'
import { useStore } from '@/store'
import { uid } from '@/utils/ids'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { Modal } from '@/components/shared/Modal'
import { FieldWrap, Input, Select } from '@/components/shared/FormField'
import type { User, UserRole } from '@/types'

const roles: UserRole[] = ['Winemaker', 'Vineyard', 'Admin', 'Viewer']

export function Settings() {
  const { users, updateUser } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [editVals, setEditVals] = useState<Partial<User>>({})

  const startEdit = (user: User) => {
    setEditing(user.id)
    setEditVals({ name: user.name, role: user.role, email: user.email, status: user.status })
  }

  const saveEdit = () => {
    if (!editing) return
    updateUser(editing, editVals)
    setEditing(null)
  }

  const roleVariantMap: Record<UserRole, 'accent' | 'sage' | 'muted' | 'default'> = {
    Winemaker: 'accent',
    Vineyard: 'sage',
    Admin: 'default',
    Viewer: 'muted',
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="px-10 pt-10 pb-0">
        <p className="text-xs font-mono text-[#A8A29E] uppercase tracking-widest mb-2">Contrada</p>
        <h1 className="text-3xl font-serif text-[#1A1814]">Settings</h1>
      </div>

      <div className="px-10 mt-8 pb-12 max-w-2xl">
        {/* User Management */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-serif text-[#1A1814]">User Management</h2>
              <p className="text-xs font-sans text-[#A8A29E] mt-0.5">Users available for task assignment throughout the app. No auth required.</p>
            </div>
            <Button size="sm" variant="primary" onClick={() => setShowAdd(true)}>
              <Plus size={13} /> Add User
            </Button>
          </div>

          <div className="bg-white border border-[#E5DED6] rounded-[4px] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0EBE3]">
                  {['Name', 'Role', 'Email', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#A8A29E]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-[#F8F5F0] hover:bg-[#FDFAF7] group">
                    {editing === user.id ? (
                      <>
                        <td className="px-3 py-2">
                          <Input value={editVals.name ?? ''} onChange={(e) => setEditVals((v) => ({ ...v, name: e.target.value }))} className="py-1" autoFocus />
                        </td>
                        <td className="px-3 py-2">
                          <Select value={editVals.role ?? user.role} onChange={(e) => setEditVals((v) => ({ ...v, role: e.target.value as UserRole }))} className="py-1">
                            {roles.map((r) => <option key={r}>{r}</option>)}
                          </Select>
                        </td>
                        <td className="px-3 py-2">
                          <Input type="email" value={editVals.email ?? ''} onChange={(e) => setEditVals((v) => ({ ...v, email: e.target.value }))} className="py-1" />
                        </td>
                        <td className="px-3 py-2">
                          <Select value={editVals.status ?? user.status} onChange={(e) => setEditVals((v) => ({ ...v, status: e.target.value as 'active' | 'inactive' }))} className="py-1">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </Select>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <button onClick={saveEdit} className="text-[#7A8C6E] hover:text-green-600 cursor-pointer"><Check size={14} /></button>
                            <button onClick={() => setEditing(null)} className="text-[#A8A29E] cursor-pointer"><X size={14} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-sans font-medium text-[#1A1814]">{user.name}</td>
                        <td className="px-4 py-3">
                          <Badge variant={roleVariantMap[user.role]}>{user.role}</Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-[#6B6560]">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-mono ${user.status === 'active' ? 'text-[#7A8C6E]' : 'text-[#A8A29E]'}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => startEdit(user)}
                            className="opacity-0 group-hover:opacity-100 text-[#C9BEB5] hover:text-[#B85C38] transition-all cursor-pointer"
                          >
                            <Edit2 size={13} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* App info */}
        <section className="mt-10 pt-8 border-t border-[#E5DED6]">
          <h2 className="text-base font-serif text-[#1A1814] mb-4">Application</h2>
          <div className="space-y-3">
            <InfoRow label="Application" value="Contrada" />
            <InfoRow label="Estate" value="Ngeringa, Adelaide Hills" />
            <InfoRow label="Mode" value="Biodynamic" />
            <InfoRow label="Storage" value="localStorage (no backend)" />
            <InfoRow label="Version" value="1.0.0-mvp" />
          </div>
        </section>
      </div>

      <AddUserModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#F0EBE3]">
      <span className="text-xs font-mono uppercase tracking-wider text-[#A8A29E]">{label}</span>
      <span className="text-sm font-sans text-[#6B6560]">{value}</span>
    </div>
  )
}

function AddUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addUser } = useStore()
  const [form, setForm] = useState({ name: '', role: 'Vineyard' as UserRole, email: '' })
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = () => {
    if (!form.name) return
    addUser({
      id: uid(),
      name: form.name,
      role: form.role,
      email: form.email,
      status: 'active',
      createdAt: new Date().toISOString(),
    })
    onClose()
    setForm({ name: '', role: 'Vineyard', email: '' })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add User"
      subtitle="Add a staff member for task assignment"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!form.name}>Add User</Button>
        </>
      }
    >
      <div className="space-y-4">
        <FieldWrap label="Full Name" required>
          <Input placeholder="Jane Smith" value={form.name} onChange={(e) => set('name', e.target.value)} />
        </FieldWrap>
        <FieldWrap label="Role" required>
          <Select value={form.role} onChange={(e) => set('role', e.target.value as UserRole)}>
            {roles.map((r) => <option key={r}>{r}</option>)}
          </Select>
        </FieldWrap>
        <FieldWrap label="Email">
          <Input type="email" placeholder="jane@ngeringa.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </FieldWrap>
      </div>
    </Modal>
  )
}
