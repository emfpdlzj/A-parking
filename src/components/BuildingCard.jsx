import React from 'react'

export default function BuildingCard({ name, onClick }){
  return (
    <div className="building-card card" onClick={onClick} role="button">
      <div className="text-xl font-semibold">{name}</div>
      <div className="text-sm text-gray-500">주차장</div>
      <div className="text-xs text-gray-400 mt-2">선택하여 주차장 현황 확인</div>
    </div>
  )
}
