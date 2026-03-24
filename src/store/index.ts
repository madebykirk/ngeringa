import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  Parcel, Pick, VineyardTask, Batch, DailyLogEntry, BatchAction,
  BottledLot, Tank, Barrel, Equipment, Chemical, User, Worksheet,
  ActivityEntry, SeasonRecord
} from '@/types'

// ─── Seed Data ───────────────────────────────────────────────────────────────

const seedUsers: User[] = [
  { id: 'u1', name: 'Erinn Klein', role: 'Winemaker', email: 'erinn@ngeringa.com', status: 'active', createdAt: '2024-01-01' },
  { id: 'u2', name: 'Lachlan Bird', role: 'Vineyard', email: 'lachlan@ngeringa.com', status: 'active', createdAt: '2024-01-01' },
  { id: 'u3', name: 'Will Nash', role: 'Winemaker', email: 'will@ngeringa.com', status: 'active', createdAt: '2024-01-01' },
]

const seedParcels: Parcel[] = [
  {
    id: 'p1', parcelId: 'VYD-001', name: 'Home Block', clone: 'Pinot Noir MV6',
    surfaceArea: 1.2, vinesPlanted: 3200, gps: '-35.1234, 138.7456',
    yearPlanted: 1997, createdAt: '2024-01-01',
    historicalData: [
      { id: 'h1', year: 2022, grossTonnage: 4.8, netTonnage: 4.2, notes: 'Excellent concentration' },
      { id: 'h2', year: 2023, grossTonnage: 5.1, netTonnage: 4.6, notes: 'Good season, late pick' },
    ]
  },
  {
    id: 'p2', parcelId: 'VYD-002', name: 'High Block', clone: 'Syrah 174',
    surfaceArea: 0.8, vinesPlanted: 2100, gps: '-35.1265, 138.7489',
    yearPlanted: 2001, createdAt: '2024-01-01',
    historicalData: [
      { id: 'h3', year: 2022, grossTonnage: 2.9, netTonnage: 2.6, notes: 'Peppery, elegant' },
      { id: 'h4', year: 2023, grossTonnage: 3.2, netTonnage: 2.9, notes: 'Whole bunch ferment' },
    ]
  },
  {
    id: 'p3', parcelId: 'VYD-003', name: 'Dam Block', clone: 'Chardonnay Clone 76',
    surfaceArea: 0.6, vinesPlanted: 1600, gps: '-35.1278, 138.7432',
    yearPlanted: 2003, createdAt: '2024-01-01',
    historicalData: [
      { id: 'h5', year: 2022, grossTonnage: 2.1, netTonnage: 1.9, notes: 'Early pick, bright acid' },
      { id: 'h6', year: 2023, grossTonnage: 2.4, netTonnage: 2.2, notes: 'Whole bunch pressed' },
    ]
  },
]

const seedTanks: Tank[] = [
  { id: 't1', tankId: 'TNK-001', literage: 2000, status: 'Clean', notes: 'Stainless, variable capacity' },
  { id: 't2', tankId: 'TNK-002', literage: 1500, status: 'Clean', notes: 'Stainless, fixed cap' },
  { id: 't3', tankId: 'TNK-003', literage: 500, status: 'Unclean', notes: 'Needs cleaning post-ferment' },
]

const seedBarrels: Barrel[] = [
  { id: 'b1', barrelId: 'BRL-001', cooper: 'François Frères', size: 228, oakOrigin: 'Allier', age: 1, status: 'Clean', notes: '1st fill' },
  { id: 'b2', barrelId: 'BRL-002', cooper: 'Taransaud', size: 228, oakOrigin: 'Tronçais', age: 3, status: 'Clean', notes: '3rd fill' },
  { id: 'b3', barrelId: 'BRL-003', cooper: 'Stockinger', size: 500, oakOrigin: 'Vosges', age: 2, status: 'Clean', notes: 'Large format, 2nd fill' },
]

// ─── Store Interface ──────────────────────────────────────────────────────────

interface ContradaStore {
  // Data
  parcels: Parcel[]
  picks: Pick[]
  vineyardTasks: VineyardTask[]
  batches: Batch[]
  bottledLots: BottledLot[]
  tanks: Tank[]
  barrels: Barrel[]
  equipment: Equipment[]
  chemicals: Chemical[]
  users: User[]
  worksheets: Worksheet[]
  activity: ActivityEntry[]

  // Parcel actions
  addParcel: (parcel: Parcel) => void
  updateParcel: (id: string, updates: Partial<Parcel>) => void
  deleteParcel: (id: string) => void
  addSeasonRecord: (parcelId: string, record: SeasonRecord) => void
  updateSeasonRecord: (parcelId: string, recordId: string, updates: Partial<SeasonRecord>) => void
  deleteSeasonRecord: (parcelId: string, recordId: string) => void

  // Pick actions
  addPick: (pick: Pick) => void
  updatePick: (id: string, updates: Partial<Pick>) => void
  deletePick: (id: string) => void
  markPickFermentStarted: (id: string) => void

  // Vineyard task actions
  addVineyardTask: (task: VineyardTask) => void
  updateVineyardTask: (id: string, updates: Partial<VineyardTask>) => void
  deleteVineyardTask: (id: string) => void

  // Batch actions
  addBatch: (batch: Batch) => void
  updateBatch: (id: string, updates: Partial<Batch>) => void
  deleteBatch: (id: string) => void
  addDailyLogEntry: (batchId: string, entry: DailyLogEntry) => void
  updateDailyLogEntry: (batchId: string, entryId: string, updates: Partial<DailyLogEntry>) => void
  addBatchAction: (batchId: string, action: BatchAction) => void
  completeBatch: (id: string, notes: string) => void

  // Bottled lots
  addBottledLot: (lot: BottledLot) => void
  updateBottledLot: (id: string, updates: Partial<BottledLot>) => void
  deleteBottledLot: (id: string) => void

  // Vessel actions
  addTank: (tank: Tank) => void
  updateTank: (id: string, updates: Partial<Tank>) => void
  deleteTank: (id: string) => void
  addBarrel: (barrel: Barrel) => void
  updateBarrel: (id: string, updates: Partial<Barrel>) => void
  deleteBarrel: (id: string) => void

  // Equipment
  addEquipment: (eq: Equipment) => void
  updateEquipment: (id: string, updates: Partial<Equipment>) => void
  deleteEquipment: (id: string) => void

  // Chemicals
  addChemical: (chem: Chemical) => void
  updateChemical: (id: string, updates: Partial<Chemical>) => void
  deleteChemical: (id: string) => void

  // Users
  addUser: (user: User) => void
  updateUser: (id: string, updates: Partial<User>) => void

  // Worksheets
  addWorksheet: (ws: Worksheet) => void
  updateWorksheet: (id: string, updates: Partial<Worksheet>) => void
  deleteWorksheet: (id: string) => void

  // Activity
  addActivity: (entry: ActivityEntry) => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStore = create<ContradaStore>()(
  persist(
    (set) => ({
      parcels: seedParcels,
      picks: [],
      vineyardTasks: [],
      batches: [],
      bottledLots: [],
      tanks: seedTanks,
      barrels: seedBarrels,
      equipment: [],
      chemicals: [],
      users: seedUsers,
      worksheets: [],
      activity: [],

      // ── Parcels ──
      addParcel: (parcel) => set((s) => ({ parcels: [...s.parcels, parcel] })),
      updateParcel: (id, updates) => set((s) => ({
        parcels: s.parcels.map((p) => p.id === id ? { ...p, ...updates } : p)
      })),
      deleteParcel: (id) => set((s) => ({ parcels: s.parcels.filter((p) => p.id !== id) })),
      addSeasonRecord: (parcelId, record) => set((s) => ({
        parcels: s.parcels.map((p) => p.id === parcelId
          ? { ...p, historicalData: [...p.historicalData, record] }
          : p)
      })),
      updateSeasonRecord: (parcelId, recordId, updates) => set((s) => ({
        parcels: s.parcels.map((p) => p.id === parcelId
          ? { ...p, historicalData: p.historicalData.map((r) => r.id === recordId ? { ...r, ...updates } : r) }
          : p)
      })),
      deleteSeasonRecord: (parcelId, recordId) => set((s) => ({
        parcels: s.parcels.map((p) => p.id === parcelId
          ? { ...p, historicalData: p.historicalData.filter((r) => r.id !== recordId) }
          : p)
      })),

      // ── Picks ──
      addPick: (pick) => set((s) => ({ picks: [...s.picks, pick] })),
      updatePick: (id, updates) => set((s) => ({
        picks: s.picks.map((p) => p.id === id ? { ...p, ...updates } : p)
      })),
      deletePick: (id) => set((s) => ({ picks: s.picks.filter((p) => p.id !== id) })),
      markPickFermentStarted: (id) => set((s) => ({
        picks: s.picks.map((p) => p.id === id ? { ...p, fermentStarted: true } : p)
      })),

      // ── Vineyard Tasks ──
      addVineyardTask: (task) => set((s) => ({ vineyardTasks: [...s.vineyardTasks, task] })),
      updateVineyardTask: (id, updates) => set((s) => ({
        vineyardTasks: s.vineyardTasks.map((t) => t.id === id ? { ...t, ...updates } : t)
      })),
      deleteVineyardTask: (id) => set((s) => ({ vineyardTasks: s.vineyardTasks.filter((t) => t.id !== id) })),

      // ── Batches ──
      addBatch: (batch) => set((s) => ({ batches: [...s.batches, batch] })),
      updateBatch: (id, updates) => set((s) => ({
        batches: s.batches.map((b) => b.id === id ? { ...b, ...updates } : b)
      })),
      deleteBatch: (id) => set((s) => ({ batches: s.batches.filter((b) => b.id !== id) })),
      addDailyLogEntry: (batchId, entry) => set((s) => ({
        batches: s.batches.map((b) => b.id === batchId
          ? { ...b, dailyLog: [...b.dailyLog, entry] }
          : b)
      })),
      updateDailyLogEntry: (batchId, entryId, updates) => set((s) => ({
        batches: s.batches.map((b) => b.id === batchId
          ? { ...b, dailyLog: b.dailyLog.map((e) => e.id === entryId ? { ...e, ...updates } : e) }
          : b)
      })),
      addBatchAction: (batchId, action) => set((s) => ({
        batches: s.batches.map((b) => b.id === batchId
          ? { ...b, actions: [...b.actions, action] }
          : b)
      })),
      completeBatch: (id, notes) => set((s) => ({
        batches: s.batches.map((b) => b.id === id
          ? { ...b, status: 'completed', completedAt: new Date().toISOString(), completionNotes: notes }
          : b)
      })),

      // ── Bottled Lots ──
      addBottledLot: (lot) => set((s) => ({ bottledLots: [...s.bottledLots, lot] })),
      updateBottledLot: (id, updates) => set((s) => ({
        bottledLots: s.bottledLots.map((l) => l.id === id ? { ...l, ...updates } : l)
      })),
      deleteBottledLot: (id) => set((s) => ({ bottledLots: s.bottledLots.filter((l) => l.id !== id) })),

      // ── Tanks ──
      addTank: (tank) => set((s) => ({ tanks: [...s.tanks, tank] })),
      updateTank: (id, updates) => set((s) => ({
        tanks: s.tanks.map((t) => t.id === id ? { ...t, ...updates } : t)
      })),
      deleteTank: (id) => set((s) => ({ tanks: s.tanks.filter((t) => t.id !== id) })),

      // ── Barrels ──
      addBarrel: (barrel) => set((s) => ({ barrels: [...s.barrels, barrel] })),
      updateBarrel: (id, updates) => set((s) => ({
        barrels: s.barrels.map((b) => b.id === id ? { ...b, ...updates } : b)
      })),
      deleteBarrel: (id) => set((s) => ({ barrels: s.barrels.filter((b) => b.id !== id) })),

      // ── Equipment ──
      addEquipment: (eq) => set((s) => ({ equipment: [...s.equipment, eq] })),
      updateEquipment: (id, updates) => set((s) => ({
        equipment: s.equipment.map((e) => e.id === id ? { ...e, ...updates } : e)
      })),
      deleteEquipment: (id) => set((s) => ({ equipment: s.equipment.filter((e) => e.id !== id) })),

      // ── Chemicals ──
      addChemical: (chem) => set((s) => ({ chemicals: [...s.chemicals, chem] })),
      updateChemical: (id, updates) => set((s) => ({
        chemicals: s.chemicals.map((c) => c.id === id ? { ...c, ...updates } : c)
      })),
      deleteChemical: (id) => set((s) => ({ chemicals: s.chemicals.filter((c) => c.id !== id) })),

      // ── Users ──
      addUser: (user) => set((s) => ({ users: [...s.users, user] })),
      updateUser: (id, updates) => set((s) => ({
        users: s.users.map((u) => u.id === id ? { ...u, ...updates } : u)
      })),

      // ── Worksheets ──
      addWorksheet: (ws) => set((s) => ({ worksheets: [...s.worksheets, ws] })),
      updateWorksheet: (id, updates) => set((s) => ({
        worksheets: s.worksheets.map((w) => w.id === id ? { ...w, ...updates } : w)
      })),
      deleteWorksheet: (id) => set((s) => ({ worksheets: s.worksheets.filter((w) => w.id !== id) })),

      // ── Activity ──
      addActivity: (entry) => set((s) => ({
        activity: [entry, ...s.activity].slice(0, 100)
      })),
    }),
    {
      name: 'contrada-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
