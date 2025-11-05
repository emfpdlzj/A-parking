import React from 'react'
import { isFav, toggleFav } from '../utils/favStorage'

export default function ParkingSlot({ slot, onClick }){
  const fav = isFav(slot.id)
  return (
    <div className="slot-wrapper">
      <div className={`slot ${slot.occupied ? 'occ' : 'free'}`} title={`번호 ${slot.id} - ${slot.occupied ? '주차중' : '이용 가능'}`} onClick={()=>onClick(slot)}>
        {slot.id}
      </div>
      <button className="fav-btn" onClick={(e)=>{ e.stopPropagation(); toggleFav(slot.id); window.dispatchEvent(new CustomEvent('favChange')) }} aria-label="toggle favorite">
        {fav ? '★' : '☆'}
      </button>
    </div>
  )
}
