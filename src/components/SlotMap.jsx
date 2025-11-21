import React from 'react'
import ParkingSlot from './ParkingSlot'

function makeSampleSlots(count){
  return Array.from({length: count}, (_,i)=>({ id: i+1, occupied: Math.random() > 0.6 }))
}

export default function SlotMap({ slots = null, onSelect = ()=>{} }){
  // If caller didn't pass slots, make a sensible sample set so the map renders
  const data = Array.isArray(slots) && slots.length ? slots : makeSampleSlots(130)

  // helper to pick slots by id range (inclusive)
  const byRange = (start, end) => data.slice(start-1, end).map(s => <ParkingSlot key={s.id} slot={s} onClick={onSelect} />)

  return (
    <div className="space-y-6">
  {/* Header */}
  <div className="text-center text-2xl font-bold bg-[var(--blue)] text-white inline-block px-6 py-2 rounded-md mx-auto">🚗 주차관리시스템</div>

      <div>
        {/* Map area (full width) */}
        <div className="map-area relative">
          {/* Entrance bar */}
          <div className="w-full bg-gray-700 text-white rounded-md py-2 text-center mb-4">↓ 입구 ↓</div>

          {/* Large parking map - approximate layout with groups (expanded to full width) */}
          <div className="grid grid-cols-3 gap-6">
            {/* Column 1 */}
            <div className="space-y-6">
              <div className="card p-3 bg-[#f0f6fb]">
                <div className="flex flex-wrap justify-start">
                  {byRange(1,20)}
                </div>
              </div>

              <div className="card p-3 bg-[#f0f6fb]">
                <div className="flex flex-wrap justify-start">
                  {byRange(41,60)}
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-6">
              <div className="card p-3 bg-[#f0f6fb]">
                <div className="flex flex-wrap justify-start">
                  {byRange(21,40)}
                </div>
              </div>

              <div className="card p-3 bg-[#f0f6fb]">
                <div className="flex flex-wrap justify-start">
                  {byRange(61,90)}
                </div>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-6">
              <div className="card p-3 bg-[#f0f6fb]">
                <div className="flex flex-wrap justify-start">
                  {byRange(91,110)}
                </div>
              </div>

              <div className="card p-3 bg-[#f0f6fb]">
                <div className="flex flex-wrap justify-start">
                  {byRange(111,130)}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom building blue strip */}
          <div className="absolute left-0 right-0 bottom-0 mx-6 -mb-6 bg-[var(--blue)] text-white rounded-md text-center py-4">팔달관</div>
        </div>
      </div>
    </div>
  )
}
