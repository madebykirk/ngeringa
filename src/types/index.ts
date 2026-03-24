// ─── Core Entities ──────────────────────────────────────────────────────────

export interface Parcel {
  id: string
  parcelId: string         // e.g. VYD-001
  name: string             // e.g. "Home Block"
  clone: string            // e.g. "Pinot Noir MV6"
  surfaceArea: number      // hectares
  vinesPlanted: number
  gps: string              // lat/long or descriptive
  yearPlanted: number
  historicalData: SeasonRecord[]
  createdAt: string
}

export interface SeasonRecord {
  id: string
  year: number
  grossTonnage: number
  netTonnage: number
  notes: string
}

// ─── Vineyard Activity ──────────────────────────────────────────────────────

export interface Pick {
  id: string
  parcelId: string
  date: string
  grossWeight: number      // kg
  netWeight: number        // kg
  ph: number
  baume: number
  notes: string
  fermentStarted: boolean
  createdAt: string
}

export interface VineyardTask {
  id: string
  parcelId: string | 'all'
  type: VineyardTaskType
  date: string
  assignedUserId: string
  notes: string
  createdAt: string
}

export type VineyardTaskType =
  | 'Spraying'
  | 'Canopy management'
  | 'Soil work'
  | 'Irrigation'
  | 'Monitoring'
  | 'Other'

// ─── Cellar ─────────────────────────────────────────────────────────────────

export interface Batch {
  id: string
  batchId: string          // e.g. PIN_3
  nickname: string
  pickId: string
  parcelId: string
  vesselId: string
  vesselType: 'tank' | 'barrel'
  startDate: string
  status: 'active' | 'completed'
  completedAt?: string
  completionNotes?: string
  dailyLog: DailyLogEntry[]
  actions: BatchAction[]
  createdAt: string
}

export interface DailyLogEntry {
  id: string
  date: string
  ph: number | null
  baume: number | null
  temperature: number | null
  notes: string
}

export interface BatchAction {
  id: string
  type: BatchActionType
  date: string
  notes: string
  assignedUserId?: string
  // Type-specific fields
  vesselId?: string          // for Clean, Rack (from/to), Pumpover, Plunge
  vesselType?: 'tank' | 'barrel'
  toVesselId?: string        // for Rack destination
  toVesselType?: 'tank' | 'barrel'
  chemicalId?: string        // for Addition
  chemicalAmount?: number
  chemicalUnit?: string
  samplePh?: number | null   // for Sample
  sampleBaume?: number | null
  sampleTemp?: number | null
  bottleCount?: number       // for Bottle
}

export type BatchActionType =
  | 'Clean'
  | 'Addition'
  | 'Sample'
  | 'Rack'
  | 'Pumpover'
  | 'Plunge'
  | 'Bottle'
  | 'Filter'
  | 'Settle'

// ─── Inventory ───────────────────────────────────────────────────────────────

export interface BottledLot {
  id: string
  lotId: string
  vintage: number
  parcelId: string
  variety: string
  clone: string
  fermentMethod: string
  vesselAged: string
  alc: number
  bottles: number
  notes: string
  createdAt: string
}

// ─── Vessels ─────────────────────────────────────────────────────────────────

export interface Tank {
  id: string
  tankId: string
  literage: number
  status: VesselStatus
  notes: string
}

export interface Barrel {
  id: string
  barrelId: string
  cooper: string
  size: number             // litres
  oakOrigin: string
  age: number              // years
  status: VesselStatus
  notes: string
}

export type VesselStatus = 'Clean' | 'Unclean' | 'Other'

// ─── Equipment ───────────────────────────────────────────────────────────────

export interface Equipment {
  id: string
  equipmentId: string
  type: 'destemmer' | 'press'
  makeModel: string
  capacity: string
  lastServiceDate: string
  notes: string
}

// ─── Chemicals ───────────────────────────────────────────────────────────────

export interface Chemical {
  id: string
  name: string
  category: ChemicalCategory
  stock: number
  unit: string
  notes: string
}

export type ChemicalCategory =
  | 'Fining agent'
  | 'Nutrient'
  | 'SO2'
  | 'Acid'
  | 'Enzyme'
  | 'Other'

// ─── Users ───────────────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  role: UserRole
  email: string
  status: 'active' | 'inactive'
  createdAt: string
}

export type UserRole = 'Winemaker' | 'Vineyard' | 'Admin' | 'Viewer'

// ─── Worksheets ──────────────────────────────────────────────────────────────

export interface Worksheet {
  id: string
  date: string
  tasks: WorksheetTask[]
  createdAt: string
}

export interface WorksheetTask {
  id: string
  type: WorksheetTaskType
  parcelId?: string
  batchId?: string
  description: string
  assignedUserId: string
  ph?: string
  baume?: string
  temp?: string
  notes: string
}

export type WorksheetTaskType =
  | 'vineyard-pick'
  | 'vineyard-task'
  | 'cellar-test'
  | 'cellar-action'
  | 'custom'

// ─── Activity Feed ───────────────────────────────────────────────────────────

export interface ActivityEntry {
  id: string
  type: 'pick' | 'vineyard-task' | 'batch-created' | 'batch-action' | 'batch-log' | 'lot-bottled' | 'worksheet'
  description: string
  date: string
  parcelId?: string
  batchId?: string
  relatedId?: string
}
