import { Routes, Route } from 'react-router-dom'
import { BatchList } from './BatchList'
import { BatchDetail } from './BatchDetail'

export function Cellar() {
  return (
    <Routes>
      <Route index element={<BatchList />} />
      <Route path=":batchId" element={<BatchDetail />} />
    </Routes>
  )
}
