import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ParcelGrid } from './ParcelGrid'
import { ParcelDetail } from './ParcelDetail'

export function Vineyard() {
  return (
    <Routes>
      <Route index element={<ParcelGrid />} />
      <Route path=":parcelId" element={<ParcelDetail />} />
    </Routes>
  )
}

export { useState }
