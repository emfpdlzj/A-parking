import React from 'react'
import ParkingSlot from './ParkingSlot'

export default function SlotMap({ slots = [], onSelect = ()=>{} }){
  // simple wrap layout: you can replace with SVG map later
  return (
    <div className="flex flex-wrap">
      {slots.map(s => <ParkingSlot key={s.id} slot={s} onClick={onSelect} />)}
    </div>
  )
}
