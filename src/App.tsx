import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Overview } from '@/components/overview/Overview'
import { Vineyard } from '@/components/vineyard/Vineyard'
import { Cellar } from '@/components/cellar/Cellar'
import { Inventory } from '@/components/inventory/Inventory'
import { Worksheets } from '@/components/overview/Worksheets'
import { Settings } from '@/components/settings/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/vineyard/*" element={<Vineyard />} />
          <Route path="/cellar/*" element={<Cellar />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/worksheets" element={<Worksheets />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
